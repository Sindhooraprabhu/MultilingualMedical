from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Hospital(db.Model):
    __tablename__ = 'hospitals'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    address = db.Column(db.Text, nullable=False)
    contact = db.Column(db.String(50), nullable=False)
    specialties = db.Column(db.Text) # Stored as comma-separated or JSON string
    
    # Relationships
    doctors = db.relationship('Doctor', backref='hospital', lazy=True)
    patients = db.relationship('Patient', backref='hospital', lazy=True)

class Doctor(db.Model):
    __tablename__ = 'doctors'
    
    id = db.Column(db.String(20), primary_key=True) # e.g. DOC-001
    name = db.Column(db.String(100), nullable=False)
    specialization = db.Column(db.String(100), nullable=False)
    languages_spoken = db.Column(db.Text) # Comma-separated
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'), nullable=False)
    
    # Relationships
    consultations = db.relationship('Consultation', backref='doctor', lazy=True)

class Patient(db.Model):
    __tablename__ = 'patients'
    
    id = db.Column(db.String(20), primary_key=True) # e.g. PAT-001
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    preferred_language = db.Column(db.String(50), nullable=False)
    contact_number = db.Column(db.String(20), nullable=False)
    qr_code_url = db.Column(db.String(255))
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospitals.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    consultations = db.relationship('Consultation', backref='patient', lazy=True)
    prescriptions = db.relationship('Prescription', backref='patient', lazy=True)
    lab_tests = db.relationship('LabTest', backref='patient', lazy=True)

class Consultation(db.Model):
    __tablename__ = 'consultations'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.String(20), db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.String(20), db.ForeignKey('doctors.id')) # Assigned doctor
    date = db.Column(db.DateTime, default=datetime.utcnow)
    original_transcript = db.Column(db.Text)
    translated_transcript = db.Column(db.Text)
    symptoms = db.Column(db.Text)
    diagnosis = db.Column(db.Text)
    doctor_notes = db.Column(db.Text)
    follow_up_instructions = db.Column(db.Text)
    status = db.Column(db.String(50), default='Pending') # Pending, In-Progress, Completed
    
    # Relationships
    prescriptions = db.relationship('Prescription', backref='consultation', lazy=True)
    lab_tests = db.relationship('LabTest', backref='consultation', lazy=True)

class Prescription(db.Model):
    __tablename__ = 'prescriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    consultation_id = db.Column(db.Integer, db.ForeignKey('consultations.id'), nullable=False)
    patient_id = db.Column(db.String(20), db.ForeignKey('patients.id'), nullable=False)
    medicine_name = db.Column(db.String(255), nullable=False)
    dosage = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), default='Pending') # Pending or Dispensed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class LabTest(db.Model):
    __tablename__ = 'lab_tests'
    
    id = db.Column(db.Integer, primary_key=True)
    consultation_id = db.Column(db.Integer, db.ForeignKey('consultations.id'), nullable=False)
    patient_id = db.Column(db.String(20), db.ForeignKey('patients.id'), nullable=False)
    test_name = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), default='Pending') # Pending or Completed
    result = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
