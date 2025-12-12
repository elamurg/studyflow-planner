"""
StudyFlow Backend API
Flask backend with SQLite database for the StudyFlow study planner app.

Features:
- Study Sessions (time blocks on calendar)
- Deadlines (with countdown timers)
- Study Items (checklist with progress tracking)
- Notes (for future study sessions)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone
import os

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///studyflow.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Handle postgres:// vs postgresql:// for Heroku/Render
if app.config['SQLALCHEMY_DATABASE_URI'].startswith('postgres://'):
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace(
        'postgres://', 'postgresql://', 1
    )

# Enable CORS for frontend
CORS(app, origins=['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000', 
                   os.environ.get('FRONTEND_URL', '*')])

# Initialize database
db = SQLAlchemy(app)


# =============================================================================
# DATABASE MODELS
# =============================================================================

class StudySession(db.Model):
    """Time block study sessions for the calendar view"""
    __tablename__ = 'study_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    subject = db.Column(db.String(100), nullable=True)  # e.g., "Math", "Physics"
    color = db.Column(db.String(20), default='purple')  # For calendar display
    
    # Time block info
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    
    # Status
    is_completed = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), 
                          onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'subject': self.subject,
            'color': self.color,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'is_completed': self.is_completed,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Deadline(db.Model):
    """Deadlines with countdown timers"""
    __tablename__ = 'deadlines'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    subject = db.Column(db.String(100), nullable=True)  # Class/subject name
    color = db.Column(db.String(20), default='orange')
    
    # Deadline info
    due_date = db.Column(db.DateTime, nullable=False)
    priority = db.Column(db.String(20), default='medium')  # low, medium, high
    
    # Status
    is_completed = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                          onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'subject': self.subject,
            'color': self.color,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'priority': self.priority,
            'is_completed': self.is_completed,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class StudyItem(db.Model):
    """Study checklist items with progress tracking"""
    __tablename__ = 'study_items'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    subject = db.Column(db.String(100), nullable=True)
    
    # Progress tracking
    is_completed = db.Column(db.Boolean, default=False)
    order = db.Column(db.Integer, default=0)  # For ordering items in list
    
    # Optional: link to a deadline
    deadline_id = db.Column(db.Integer, db.ForeignKey('deadlines.id'), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                          onupdate=lambda: datetime.now(timezone.utc))
    completed_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'subject': self.subject,
            'is_completed': self.is_completed,
            'order': self.order,
            'deadline_id': self.deadline_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class Note(db.Model):
    """Notes for future study sessions"""
    __tablename__ = 'notes'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    subject = db.Column(db.String(100), nullable=True)
    
    # Optional: link to a study session
    session_id = db.Column(db.Integer, db.ForeignKey('study_sessions.id'), nullable=True)
    
    # For "future self" notes - when should this be shown?
    show_date = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                          onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'subject': self.subject,
            'session_id': self.session_id,
            'show_date': self.show_date.isoformat() if self.show_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Subject(db.Model):
    """Classes/subjects for organization"""
    __tablename__ = 'subjects'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    color = db.Column(db.String(20), default='purple')
    
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'color': self.color,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


# =============================================================================
# API ROUTES - STUDY SESSIONS
# =============================================================================

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    """Get all study sessions, optionally filtered by date range"""
    start = request.args.get('start')
    end = request.args.get('end')
    
    query = StudySession.query
    
    if start:
        query = query.filter(StudySession.start_time >= datetime.fromisoformat(start))
    if end:
        query = query.filter(StudySession.end_time <= datetime.fromisoformat(end))
    
    sessions = query.order_by(StudySession.start_time).all()
    return jsonify([s.to_dict() for s in sessions])


@app.route('/api/sessions', methods=['POST'])
def create_session():
    """Create a new study session"""
    data = request.get_json()
    
    session = StudySession(
        title=data['title'],
        description=data.get('description'),
        subject=data.get('subject'),
        color=data.get('color', 'purple'),
        start_time=datetime.fromisoformat(data['start_time']),
        end_time=datetime.fromisoformat(data['end_time']),
        is_completed=data.get('is_completed', False)
    )
    
    db.session.add(session)
    db.session.commit()
    
    return jsonify(session.to_dict()), 201


@app.route('/api/sessions/<int:id>', methods=['GET'])
def get_session(id):
    """Get a single study session"""
    session = StudySession.query.get_or_404(id)
    return jsonify(session.to_dict())


@app.route('/api/sessions/<int:id>', methods=['PUT'])
def update_session(id):
    """Update a study session (including moving time blocks)"""
    session = StudySession.query.get_or_404(id)
    data = request.get_json()
    
    if 'title' in data:
        session.title = data['title']
    if 'description' in data:
        session.description = data['description']
    if 'subject' in data:
        session.subject = data['subject']
    if 'color' in data:
        session.color = data['color']
    if 'start_time' in data:
        session.start_time = datetime.fromisoformat(data['start_time'])
    if 'end_time' in data:
        session.end_time = datetime.fromisoformat(data['end_time'])
    if 'is_completed' in data:
        session.is_completed = data['is_completed']
    
    db.session.commit()
    return jsonify(session.to_dict())


@app.route('/api/sessions/<int:id>', methods=['DELETE'])
def delete_session(id):
    """Delete a study session"""
    session = StudySession.query.get_or_404(id)
    db.session.delete(session)
    db.session.commit()
    return '', 204


# =============================================================================
# API ROUTES - DEADLINES
# =============================================================================

@app.route('/api/deadlines', methods=['GET'])
def get_deadlines():
    """Get all deadlines, optionally filtered"""
    completed = request.args.get('completed')
    subject = request.args.get('subject')
    
    query = Deadline.query
    
    if completed is not None:
        query = query.filter(Deadline.is_completed == (completed.lower() == 'true'))
    if subject:
        query = query.filter(Deadline.subject == subject)
    
    deadlines = query.order_by(Deadline.due_date).all()
    return jsonify([d.to_dict() for d in deadlines])


@app.route('/api/deadlines', methods=['POST'])
def create_deadline():
    """Create a new deadline"""
    data = request.get_json()
    
    deadline = Deadline(
        title=data['title'],
        description=data.get('description'),
        subject=data.get('subject'),
        color=data.get('color', 'orange'),
        due_date=datetime.fromisoformat(data['due_date']),
        priority=data.get('priority', 'medium'),
        is_completed=data.get('is_completed', False)
    )
    
    db.session.add(deadline)
    db.session.commit()
    
    return jsonify(deadline.to_dict()), 201


@app.route('/api/deadlines/<int:id>', methods=['GET'])
def get_deadline(id):
    """Get a single deadline"""
    deadline = Deadline.query.get_or_404(id)
    return jsonify(deadline.to_dict())


@app.route('/api/deadlines/<int:id>', methods=['PUT'])
def update_deadline(id):
    """Update a deadline"""
    deadline = Deadline.query.get_or_404(id)
    data = request.get_json()
    
    if 'title' in data:
        deadline.title = data['title']
    if 'description' in data:
        deadline.description = data['description']
    if 'subject' in data:
        deadline.subject = data['subject']
    if 'color' in data:
        deadline.color = data['color']
    if 'due_date' in data:
        deadline.due_date = datetime.fromisoformat(data['due_date'])
    if 'priority' in data:
        deadline.priority = data['priority']
    if 'is_completed' in data:
        deadline.is_completed = data['is_completed']
    
    db.session.commit()
    return jsonify(deadline.to_dict())


@app.route('/api/deadlines/<int:id>', methods=['DELETE'])
def delete_deadline(id):
    """Delete a deadline"""
    deadline = Deadline.query.get_or_404(id)
    db.session.delete(deadline)
    db.session.commit()
    return '', 204


# =============================================================================
# API ROUTES - STUDY ITEMS (Checklist)
# =============================================================================

@app.route('/api/items', methods=['GET'])
def get_items():
    """Get all study items"""
    completed = request.args.get('completed')
    subject = request.args.get('subject')
    deadline_id = request.args.get('deadline_id')
    
    query = StudyItem.query
    
    if completed is not None:
        query = query.filter(StudyItem.is_completed == (completed.lower() == 'true'))
    if subject:
        query = query.filter(StudyItem.subject == subject)
    if deadline_id:
        query = query.filter(StudyItem.deadline_id == int(deadline_id))
    
    items = query.order_by(StudyItem.order, StudyItem.created_at).all()
    return jsonify([i.to_dict() for i in items])


@app.route('/api/items', methods=['POST'])
def create_item():
    """Create a new study item"""
    data = request.get_json()
    
    # Get max order for new item
    max_order = db.session.query(db.func.max(StudyItem.order)).scalar() or 0
    
    item = StudyItem(
        title=data['title'],
        description=data.get('description'),
        subject=data.get('subject'),
        is_completed=data.get('is_completed', False),
        order=data.get('order', max_order + 1),
        deadline_id=data.get('deadline_id')
    )
    
    db.session.add(item)
    db.session.commit()
    
    return jsonify(item.to_dict()), 201


@app.route('/api/items/<int:id>', methods=['PUT'])
def update_item(id):
    """Update a study item (including marking complete)"""
    item = StudyItem.query.get_or_404(id)
    data = request.get_json()
    
    if 'title' in data:
        item.title = data['title']
    if 'description' in data:
        item.description = data['description']
    if 'subject' in data:
        item.subject = data['subject']
    if 'order' in data:
        item.order = data['order']
    if 'deadline_id' in data:
        item.deadline_id = data['deadline_id']
    if 'is_completed' in data:
        item.is_completed = data['is_completed']
        if data['is_completed']:
            item.completed_at = datetime.now(timezone.utc)
        else:
            item.completed_at = None
    
    db.session.commit()
    return jsonify(item.to_dict())


@app.route('/api/items/<int:id>', methods=['DELETE'])
def delete_item(id):
    """Delete a study item"""
    item = StudyItem.query.get_or_404(id)
    db.session.delete(item)
    db.session.commit()
    return '', 204


@app.route('/api/items/progress', methods=['GET'])
def get_progress():
    """Get overall progress statistics"""
    total = StudyItem.query.count()
    completed = StudyItem.query.filter(StudyItem.is_completed == True).count()
    
    # Progress by subject
    subjects_progress = db.session.query(
        StudyItem.subject,
        db.func.count(StudyItem.id).label('total'),
        db.func.sum(db.case((StudyItem.is_completed == True, 1), else_=0)).label('completed')
    ).group_by(StudyItem.subject).all()
    
    by_subject = {}
    for subject, total_count, completed_count in subjects_progress:
        if subject:
            by_subject[subject] = {
                'total': total_count,
                'completed': completed_count or 0,
                'percentage': round((completed_count or 0) / total_count * 100, 1) if total_count > 0 else 0
            }
    
    return jsonify({
        'total': total,
        'completed': completed,
        'percentage': round(completed / total * 100, 1) if total > 0 else 0,
        'by_subject': by_subject
    })


# =============================================================================
# API ROUTES - NOTES
# =============================================================================

@app.route('/api/notes', methods=['GET'])
def get_notes():
    """Get all notes"""
    subject = request.args.get('subject')
    session_id = request.args.get('session_id')
    show_today = request.args.get('show_today')
    
    query = Note.query
    
    if subject:
        query = query.filter(Note.subject == subject)
    if session_id:
        query = query.filter(Note.session_id == int(session_id))
    if show_today:
        today = datetime.now(timezone.utc).date()
        query = query.filter(
            db.or_(
                Note.show_date == None,
                db.func.date(Note.show_date) <= today
            )
        )
    
    notes = query.order_by(Note.created_at.desc()).all()
    return jsonify([n.to_dict() for n in notes])


@app.route('/api/notes', methods=['POST'])
def create_note():
    """Create a new note"""
    data = request.get_json()
    
    note = Note(
        title=data['title'],
        content=data['content'],
        subject=data.get('subject'),
        session_id=data.get('session_id'),
        show_date=datetime.fromisoformat(data['show_date']) if data.get('show_date') else None
    )
    
    db.session.add(note)
    db.session.commit()
    
    return jsonify(note.to_dict()), 201


@app.route('/api/notes/<int:id>', methods=['PUT'])
def update_note(id):
    """Update a note"""
    note = Note.query.get_or_404(id)
    data = request.get_json()
    
    if 'title' in data:
        note.title = data['title']
    if 'content' in data:
        note.content = data['content']
    if 'subject' in data:
        note.subject = data['subject']
    if 'session_id' in data:
        note.session_id = data['session_id']
    if 'show_date' in data:
        note.show_date = datetime.fromisoformat(data['show_date']) if data['show_date'] else None
    
    db.session.commit()
    return jsonify(note.to_dict())


@app.route('/api/notes/<int:id>', methods=['DELETE'])
def delete_note(id):
    """Delete a note"""
    note = Note.query.get_or_404(id)
    db.session.delete(note)
    db.session.commit()
    return '', 204


# =============================================================================
# API ROUTES - SUBJECTS
# =============================================================================

@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    """Get all subjects"""
    subjects = Subject.query.order_by(Subject.name).all()
    return jsonify([s.to_dict() for s in subjects])


@app.route('/api/subjects', methods=['POST'])
def create_subject():
    """Create a new subject"""
    data = request.get_json()
    
    subject = Subject(
        name=data['name'],
        color=data.get('color', 'purple')
    )
    
    db.session.add(subject)
    db.session.commit()
    
    return jsonify(subject.to_dict()), 201


@app.route('/api/subjects/<int:id>', methods=['DELETE'])
def delete_subject(id):
    """Delete a subject"""
    subject = Subject.query.get_or_404(id)
    db.session.delete(subject)
    db.session.commit()
    return '', 204


# =============================================================================
# HEALTH CHECK
# =============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for deployment"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now(timezone.utc).isoformat()})


# =============================================================================
# DATABASE INITIALIZATION
# =============================================================================

def init_db():
    """Initialize the database"""
    with app.app_context():
        db.create_all()
        print("Database initialized!")


# =============================================================================
# RUN APP
# =============================================================================

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true')