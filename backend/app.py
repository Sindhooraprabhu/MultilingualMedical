import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Patient, Consultation, Prescription, LabTest
from dotenv import load_dotenv
import random
import time
from deep_translator import GoogleTranslator

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

# Initialize database
with app.app_context():
    db.create_all()

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
        original_transcript=data.get('original_transcript'),
        translated_transcript=data.get('translated_transcript'),
        symptoms=data.get('symptoms'),
        diagnosis=data.get('diagnosis'),
        doctor_notes=data.get('doctor_notes'),
        follow_up_instructions=data.get('follow_up_instructions')
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
    Mock AI endpoint that takes a transcript and generates structured medical data.
    """
    data = request.json
    transcript = data.get('transcript', '').lower()
    
    # Simulate processing delay
    time.sleep(1.5)
    
    # Intelligent mocked logic based on keywords
    symptoms = []
    diagnosis = "Pending evaluation"
    prescriptions = []
    lab_tests = []
    risk_alert = None
    
    # Dengue Risk Detection
    if 'fever' in transcript and ('headache' in transcript or 'body pain' in transcript):
        symptoms.extend(['High Fever', 'Severe Headache', 'Body Ache'])
        diagnosis = "Possible Dengue / Viral Fever"
        prescriptions = [
            {'medicine_name': 'Paracetamol 500mg', 'dosage': '1 tablet every 6 hours'},
            {'medicine_name': 'ORS Powder', 'dosage': 'Mix 1 sachet in 1L water, drink continuously'}
        ]
        lab_tests = [
            {'test_name': 'Complete Blood Count (CBC)'},
            {'test_name': 'Dengue NS1 Antigen'}
        ]
        risk_alert = 'Dengue Risk'
        
    # Thyroid Risk Detection
    elif 'weight gain' in transcript and ('fatigue' in transcript or 'tired' in transcript):
        symptoms.extend(['Unexplained Weight Gain', 'Extreme Fatigue'])
        diagnosis = "Hypothyroidism Suspected"
        prescriptions = [
            {'medicine_name': 'Thyroxine Sodium 50mcg', 'dosage': '1 tablet morning empty stomach'}
        ]
        lab_tests = [
            {'test_name': 'Thyroid Profile (T3, T4, TSH)'}
        ]
    
    # General Default 
    else:
        symptoms = [s.strip() for s in str(transcript).split(' ') if len(s.strip()) > 4][:3] # mocked symptoms
        if not symptoms:
            symptoms = ['General Weakness']
        diagnosis = "Need further observation"
        prescriptions = [
            {'medicine_name': 'Multivitamin', 'dosage': '1 tablet daily at night'}
        ]
    
    return jsonify({
        'symptoms': ', '.join(symptoms),
        'diagnosis': diagnosis,
        'prescriptions': prescriptions,
        'lab_tests': lab_tests,
        'risk_alert': risk_alert,
        'doctor_notes': 'Patient needs rest and adequate hydration. Follow prescribed medications.',
        'follow_up_instructions': 'Visit again after completing the lab tests or if symptoms worsen.'
    }), 200

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
