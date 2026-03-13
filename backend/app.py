import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Patient, Consultation, Prescription, LabTest, Hospital, Doctor
from dotenv import load_dotenv
import random
import time
import base64
from io import BytesIO
from deep_translator import GoogleTranslator
from gtts import gTTS

load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes so our React frontend can consume the API easily
CORS(app)

# Configure the SQLite database temporarily for the hackathon prototype
# since it's much easier to set up and run without external dependencies
# It can easily be changed to PostgreSQL by changing this URI later
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///mediflow.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Initialize database and seed data
with app.app_context():
    db.create_all()
    
    # Check if we need to seed hospitals and doctors
    if Hospital.query.count() == 0:
        h1 = Hospital(
            name="City General Hospital",
            address="123 Health Ave, Central District",
            contact="080-12345678",
            specialties="General, Cardiology, Neurology, Orthopedics"
        )
        db.session.add(h1)
        db.session.flush()
        
        doctors = [
            Doctor(id="DOC-001", name="Dr. Sarah Connor", specialization="General Physician", languages_spoken="English, Hindi, Kannada", hospital_id=h1.id),
            Doctor(id="DOC-002", name="Dr. James Smith", specialization="Cardiologist", languages_spoken="English, Hindi", hospital_id=h1.id),
            Doctor(id="DOC-003", name="Dr. Anita Desai", specialization="Neurologist", languages_spoken="English, Marathi, Hindi", hospital_id=h1.id),
            Doctor(id="DOC-004", name="Dr. Rajesh Kumar", specialization="Orthopedic", languages_spoken="English, Tamil, Telugu", hospital_id=h1.id),
            Doctor(id="DOC-005", name="Dr. Priya Sharma", specialization="Dermatologist", languages_spoken="English, Hindi, Punjabi", hospital_id=h1.id),
        ]
        db.session.add_all(doctors)
        db.session.commit()
        print("Database seeded with initial Hospital and Doctor data.")

# ==========================================
# Hospital & Doctor Routes
# ==========================================

@app.route('/api/hospitals', methods=['GET'])
def get_hospitals():
    hospitals = Hospital.query.all()
    return jsonify([{
        'id': h.id,
        'name': h.name,
        'address': h.address,
        'contact': h.contact,
        'specialties': h.specialties
    } for h in hospitals]), 200

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    doctors = Doctor.query.all()
    return jsonify([{
        'id': d.id,
        'name': d.name,
        'specialization': d.specialization,
        'languages_spoken': d.languages_spoken,
        'hospital_id': d.hospital_id
    } for d in doctors]), 200

@app.route('/api/doctors/<doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    doctor = Doctor.query.get_or_404(doctor_id)
    return jsonify({
        'id': doctor.id,
        'name': doctor.name,
        'specialization': doctor.specialization,
        'languages_spoken': doctor.languages_spoken,
        'hospital_id': doctor.hospital_id
    }), 200

# ==========================================
# Patient Routes
# ==========================================

@app.route('/api/patients', methods=['POST'])
def register_patient():
    data = request.json
    
    # Generate Patient ID
    patient_count = Patient.query.count()
    new_id = f"PAT-{(patient_count + 1):03d}"
    
    new_patient = Patient(
        id=new_id,
        name=data.get('name'),
        age=data.get('age'),
        gender=data.get('gender'),
        preferred_language=data.get('preferred_language'),
        contact_number=data.get('contact_number'),
        qr_code_url=f"/patient/{new_id}"
    )
    
    db.session.add(new_patient)
    db.session.commit()
    
    return jsonify({
        'message': 'Patient registered successfully',
        'patient_id': new_id,
        'qr_code_url': new_patient.qr_code_url
    }), 201

@app.route('/api/patients', methods=['GET'])
def get_all_patients():
    patients = Patient.query.all()
    result = []
    for p in patients:
        result.append({
            'id': p.id,
            'name': p.name,
            'age': p.age,
            'gender': p.gender,
            'contact_number': p.contact_number,
            'preferred_language': p.preferred_language
        })
    return jsonify(result), 200

@app.route('/api/patients/<patient_id>', methods=['GET'])
def get_patient(patient_id):
    patient = Patient.query.get_or_404(patient_id)
    
    return jsonify({
        'id': patient.id,
        'name': patient.name,
        'age': patient.age,
        'gender': patient.gender,
        'preferred_language': patient.preferred_language,
        'contact_number': patient.contact_number,
        'qr_code_url': patient.qr_code_url,
        'created_at': patient.created_at.isoformat()
    }), 200

# ==========================================
# System Dashboard Route
# ==========================================
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    total_patients = Patient.query.count()
    active_consultations = Consultation.query.count()
    
    # Note: in a real application, you might filter by 'Pending'
    pending_lab_tests = LabTest.query.filter_by(status='Pending').count()
    pending_prescriptions = Prescription.query.filter_by(status='Pending').count()
    
    return jsonify({
        'total_patients': total_patients,
        'active_consultations': active_consultations,
        'pending_lab_tests': pending_lab_tests,
        'pending_prescriptions': pending_prescriptions
    }), 200

# ==========================================
# Consultation Routes
# ==========================================

@app.route('/api/consultations', methods=['POST'])
def save_consultation():
    data = request.json
    
    new_consultation = Consultation(
        patient_id=data.get('patient_id'),
        doctor_id=data.get('doctor_id'), # Assigning specific doctor
        original_transcript=data.get('original_transcript'),
        translated_transcript=data.get('translated_transcript'),
        symptoms=data.get('symptoms'),
        diagnosis=data.get('diagnosis'),
        doctor_notes=data.get('doctor_notes'),
        follow_up_instructions=data.get('follow_up_instructions'),
        status='Completed' if data.get('completed') else 'In-Progress'
    )
    
    db.session.add(new_consultation)
    db.session.flush() # Get the consultation ID
    
    # Process prescriptions if any
    prescriptions = data.get('prescriptions', [])
    for p in prescriptions:
        new_prescription = Prescription(
            consultation_id=new_consultation.id,
            patient_id=data.get('patient_id'),
            medicine_name=p.get('medicine_name'),
            dosage=p.get('dosage')
        )
        db.session.add(new_prescription)
        
    # Process lab tests if any
    lab_tests = data.get('lab_tests', [])
    for test in lab_tests:
        new_test = LabTest(
            consultation_id=new_consultation.id,
            patient_id=data.get('patient_id'),
            test_name=test.get('test_name')
        )
        db.session.add(new_test)
        
    db.session.commit()
    
    return jsonify({
        'message': 'Consultation saved successfully',
        'consultation_id': new_consultation.id
    }), 201

@app.route('/api/consultations/patient/<patient_id>', methods=['GET'])
def get_patient_consultations(patient_id):
    consultations = Consultation.query.filter_by(patient_id=patient_id).order_by(Consultation.date.desc()).all()
    result = []
    
    for c in consultations:
        result.append({
            'id': c.id,
            'date': c.date.isoformat(),
            'symptoms': c.symptoms,
            'diagnosis': c.diagnosis,
            'doctor_notes': c.doctor_notes
        })
        
    return jsonify(result), 200

# ==========================================
# Pharmacy (Prescriptions) Routes
# ==========================================

@app.route('/api/prescriptions', methods=['GET'])
def get_all_prescriptions():
    prescriptions = Prescription.query.order_by(Prescription.created_at.desc()).all()
    result = []
    
    for p in prescriptions:
        patient = Patient.query.get(p.patient_id)
        result.append({
            'id': p.id,
            'patient_id': p.patient_id,
            'patient_name': patient.name if patient else 'Unknown',
            'medicine_name': p.medicine_name,
            'dosage': p.dosage,
            'status': p.status,
            'created_at': p.created_at.isoformat()
        })
        
    return jsonify(result), 200

@app.route('/api/prescriptions/<int:prescription_id>', methods=['PUT'])
def update_prescription_status(prescription_id):
    data = request.json
    prescription = Prescription.query.get_or_404(prescription_id)
    
    prescription.status = data.get('status', prescription.status)
    db.session.commit()
    
    return jsonify({'message': 'Prescription updated successfully'}), 200

# ==========================================
# Laboratory Routes
# ==========================================

@app.route('/api/lab_tests', methods=['GET'])
def get_all_lab_tests():
    lab_tests = LabTest.query.order_by(LabTest.created_at.desc()).all()
    result = []
    
    for t in lab_tests:
        patient = Patient.query.get(t.patient_id)
        result.append({
            'id': t.id,
            'patient_id': t.patient_id,
            'patient_name': patient.name if patient else 'Unknown',
            'test_name': t.test_name,
            'status': t.status,
            'result': t.result,
            'created_at': t.created_at.isoformat()
        })
        
    return jsonify(result), 200

@app.route('/api/lab_tests/<int:test_id>', methods=['PUT'])
def update_lab_test(test_id):
    data = request.json
    lab_test = LabTest.query.get_or_404(test_id)
    
    if 'status' in data:
        lab_test.status = data['status']
    if 'result' in data:
        lab_test.result = data['result']
        
    db.session.commit()
    return jsonify({'message': 'Lab test updated successfully'}), 200

# ==========================================
# Translation Route
# ==========================================

@app.route('/api/translate', methods=['POST'])
def translate_text():
    data = request.json
    text = data.get('text', '')
    source_lang = data.get('source_lang', 'auto')
    target_lang = data.get('target_lang', 'en')
    
    if source_lang and source_lang != 'auto':
        source_lang = source_lang.split('-')[0].lower()
    if target_lang and target_lang != 'auto':
        target_lang = target_lang.split('-')[0].lower()
        
    # Handle tulu fallback
    if source_lang == 'tcy': source_lang = 'kn' # Fallback to kn since Google Trans lacks Tulu
    if target_lang == 'tcy': target_lang = 'kn'
    
    if not text:
        return jsonify({'translated_text': ''}), 200
        
    try:
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        translated = translator.translate(text)
        return jsonify({'translated_text': translated}), 200
    except Exception as e:
        print(f"Translation error: {e}")
        return jsonify({'translated_text': text, 'error': str(e)}), 500

# ==========================================
# AI Mock Routes
# ==========================================

@app.route('/api/ai/analyze_consultation', methods=['POST'])
def analyze_consultation():
    """
    Enhanced AI endpoint that analyzes symptoms and assigns a suitable doctor.
    """
    data = request.json
    transcript = data.get('transcript', '').lower()
    
    # Simulate processing delay
    time.sleep(1.0)
    
    symptoms = []
    diagnosis = "Pending evaluation"
    prescriptions = []
    lab_tests = []
    risk_alert = None
    recommended_specialty = "General Physician"
    
    # Mapping logic for Intelligent Routing
    if any(word in transcript for word in ['chest pain', 'heart', 'palpitations']):
        recommended_specialty = "Cardiologist"
        symptoms.append("Chest Discomfort")
    elif any(word in transcript for word in ['joint pain', 'bone', 'fracture', 'knee']):
        recommended_specialty = "Orthopedic"
        symptoms.append("Joint Pain")
    elif any(word in transcript for word in ['skin', 'rash', 'itching']):
        recommended_specialty = "Dermatologist"
        symptoms.append("Skin Irritation")
    elif any(word in transcript for word in ['headache', 'seizure', 'numbness', 'nerve']):
        recommended_specialty = "Neurologist"
        symptoms.append("Neurological Symptoms")
    elif any(word in transcript for word in ['fever', 'cough', 'cold', 'flu']):
        recommended_specialty = "General Physician"
        symptoms.append("Fever/Cold")

    # Find a doctor with this specialty
    doctor = Doctor.query.filter_by(specialization=recommended_specialty).first()
    if not doctor:
        doctor = Doctor.query.first() # Fallback to any doctor

    # Dengue Risk Detection (existing logic)
    if 'fever' in transcript and ('headache' in transcript or 'body pain' in transcript):
        symptoms.extend(['High Fever', 'Severe Headache'])
        diagnosis = "Dengue Clinical Suspicion"
        prescriptions = [
            {'medicine_name': 'Paracetamol 500mg', 'dosage': '1 tablet 3x daily'},
            {'medicine_name': 'Hydration Fluid', 'dosage': '2L daily'}
        ]
        lab_tests = [{'test_name': 'CBC'}, {'test_name': 'Dengue NS1'}]
        risk_alert = 'Dengue Risk'
    
    return jsonify({
        'symptoms': ', '.join(symptoms) if symptoms else 'General Symptoms',
        'diagnosis': diagnosis,
        'prescriptions': prescriptions,
        'lab_tests': lab_tests,
        'risk_alert': risk_alert,
        'assigned_doctor': {
            'id': doctor.id,
            'name': doctor.name,
            'specialization': doctor.specialization
        }
    }), 200

# ==========================================
# Doctor Dashboard Routes
# ==========================================

@app.route('/api/doctor/<doctor_id>/dashboard', methods=['GET'])
def get_doctor_dashboard(doctor_id):
    consultations = Consultation.query.filter_by(doctor_id=doctor_id).order_by(Consultation.date.desc()).all()
    result = []
    for c in consultations:
        patient = Patient.query.get(c.patient_id)
        result.append({
            'consultation_id': c.id,
            'patient_id': c.patient_id,
            'patient_name': patient.name if patient else 'Unknown',
            'date': c.date.isoformat(),
            'status': c.status,
            'symptoms': c.symptoms
        })
    return jsonify(result), 200

# ==========================================
# Advanced Multi-Modal Interaction (TTS)
# ==========================================

@app.route('/api/doctor/instructions_playback', methods=['POST'])
def process_doctor_instructions():
    """
    Process doctor instructions: Translate and convert to Speech.
    """
    data = request.json
    text = data.get('text', '')
    target_lang = data.get('target_lang', 'en')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
        
    try:
        # 1. Translate
        translator = GoogleTranslator(source='auto', target=target_lang.split('-')[0])
        translated_text = translator.translate(text)
        
        # 2. TTS
        tts = gTTS(text=translated_text, lang=target_lang.split('-')[0])
        fp = BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        
        # Encode as base64 to send to frontend
        audio_base64 = base64.b64encode(fp.read()).decode('utf-8')
        
        return jsonify({
            'translated_text': translated_text,
            'audio_base64': audio_base64
        }), 200
    except Exception as e:
        print(f"TTS/Translation error: {e}")
        return jsonify({'error': str(e)}), 500

# ==========================================
# Hospital Admin Dashboard
# ==========================================

@app.route('/api/hospital/dashboard', methods=['GET'])
def get_hospital_dashboard():
    stats = {
        'total_patients': Patient.query.count(),
        'total_doctors': Doctor.query.count(),
        'active_consultations': Consultation.query.filter(Consultation.status != 'Completed').count(),
        'pending_lab_tests': LabTest.query.filter_by(status='Pending').count(),
        'pending_prescriptions': Prescription.query.filter_by(status='Pending').count()
    }
    return jsonify(stats), 200

# ==========================================
# Export / Report Routes
# ==========================================

@app.route('/api/reports/patient/<patient_id>', methods=['GET'])
def generate_report(patient_id):
    # Mocking a PDF generation response for now
    # In a full implementation, reportlab would be used here.
    return jsonify({
        'message': 'Report generated',
        'download_url': f'/api/mock/download/{patient_id}.pdf'
    }), 200

# ==========================================
# Run the application
# ==========================================
if __name__ == '__main__':
    app.run(debug=True, port=5000)
