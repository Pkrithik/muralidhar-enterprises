from flask import Flask, render_template, request, jsonify, make_response, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from functools import wraps
import os
def india_time():
    return datetime.utcnow() + timedelta(hours=5, minutes=30)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'super-secret-key-muralidhar-ev'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dealership.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), nullable=True)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=india_time)

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), nullable=True)
    vehicle = db.Column(db.String(50), nullable=False)
    color = db.Column(db.String(50), nullable=False)
    message = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=india_time)

with app.app_context():
    db.create_all()

# Admin Auth Decorator
def check_auth(username, password):
    return username == 'admin' and password == 'dsr@2026'

def authenticate():
    return make_response(
        'Could not verify your access level for that URL.\n'
        'You have to login with proper credentials', 401,
        {'WWW-Authenticate': 'Basic realm="Login Required"'})

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/contact', methods=['POST'])
def submit_contact():
    data = request.json
    if not data or not data.get('name') or not data.get('phone') or not data.get('message'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    new_contact = Contact(
        name=data['name'],
        phone=data['phone'],
        email=data.get('email', ''),
        message=data['message']
    )
    db.session.add(new_contact)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Contact saved'}), 201

@app.route('/api/book', methods=['POST'])
def submit_booking():
    data = request.json
    if not data or not data.get('name') or not data.get('phone') or not data.get('vehicle') or not data.get('color'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    new_booking = Booking(
        name=data['name'],
        phone=data['phone'],
        email=data.get('email', ''),
        vehicle=data['vehicle'],
        color=data['color'],
        message=data.get('message', '')
    )
    db.session.add(new_booking)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Booking saved'}), 201

@app.route('/admin-login', methods=['GET','POST'])
def admin_login():

    if request.method == 'POST':

        username = request.form.get('username')
        password = request.form.get('password')

        if username == 'admin' and password == 'dsr@2026':
            session['admin'] = True
            return redirect('/admin')

        return render_template(
            'admin_login.html',
            error='Invalid Username or Password'
        )

    return render_template('admin_login.html')

@app.route('/logout')
def logout():

    session.clear()

    return redirect('/admin-login')

@app.route('/admin')
def admin_dashboard():

    if not session.get('admin'):
        return redirect('/admin-login')

    return render_template('admin.html')

@app.route('/api/admin/enquiries', methods=['GET'])
@requires_auth
def get_enquiries():
    enquiries = Contact.query.order_by(Contact.created_at.desc()).all()
    return jsonify([{
        'id': e.id, 'name': e.name, 'phone': e.phone, 'email': e.email,
        'message': e.message, 'created_at': e.created_at.strftime('%Y-%m-%d %H:%M:%S')
    } for e in enquiries])

@app.route('/api/admin/bookings', methods=['GET'])
@requires_auth
def get_bookings():
    bookings = Booking.query.order_by(Booking.created_at.desc()).all()
    return jsonify([{
        'id': b.id, 'name': b.name, 'phone': b.phone, 'email': b.email,
        'vehicle': b.vehicle, 'color': b.color, 'message': b.message,
        'created_at': b.created_at.strftime('%Y-%m-%d %H:%M:%S')
    } for b in bookings])

@app.route('/api/admin/enquiries/<int:id>', methods=['DELETE'])
@requires_auth
def delete_enquiry(id):
    enquiry = Contact.query.get_or_404(id)
    db.session.delete(enquiry)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/admin/bookings/<int:id>', methods=['DELETE'])
@requires_auth
def delete_booking(id):
    booking = Booking.query.get_or_404(id)
    db.session.delete(booking)
    db.session.commit()
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=False, port=5000)
