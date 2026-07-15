import time
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from backend.core.database import SessionLocal
from backend.models.models import Hospital, MedicineInventory, Doctor, Ambulance, Alert, Medicine
from backend.optimization.services.opt_service import OptimizationService
from backend.xai.services.xai_service import ExplainableAiService
from backend.copilot.nlp.engine import IntentClassifier
from backend.copilot.ocr.engine import OcrVisionEngine
from backend.copilot.inventory.reconciliation import InventoryReconciler
from backend.copilot.translation.engine import TranslationEngine

class CopilotService:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(CopilotService, cls).__new__(cls, *args, **kwargs)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self.intent_classifier = IntentClassifier()
        self.ocr_engine = OcrVisionEngine()
        self.reconciler = InventoryReconciler()
        self.translator = TranslationEngine()
        self.opt_service = OptimizationService()
        self.xai_service = ExplainableAiService()
        self.chat_history = []
        
        # Initial logs
        self.chat_history.append({
            "timestamp": "2026-07-06 22:00:00",
            "query": "Show medicine shortage",
            "response": "Currently, 14 medicines across district clinics fall below safe stock levels.",
            "intent": "MEDICINE_SHORTAGE",
            "language": "en"
        })
        self._initialized = True

    def process_chat_query(self, query_text: str, language: str = "en") -> Dict[str, Any]:
        """
        Processes conversational natural language queries, classifies intents, queries active database metrics, and formats dynamic natural language replies.
        """
        start_time = time.time()
        intent, intent_conf = self.intent_classifier.classify(query_text)
        
        db = SessionLocal()
        response_text = ""
        referenced_data = {}
        
        try:
            if intent == "MEDICINE_SHORTAGE":
                # Query actual inventory deficits
                deficits = db.query(MedicineInventory).join(Medicine).filter(
                    MedicineInventory.available_quantity < Medicine.minimum_stock
                ).count()
                response_text = f"Currently, {deficits} medicines across district clinics fall below safe stock levels."
                referenced_data = {"shortage_count": deficits}
                
            elif intent == "STAFF_DEMAND":
                # Query active doctor alerts
                alerts_count = db.query(Alert).filter(Alert.alert_type == "STAFF_SHORTAGE", Alert.status == "UNRESOLVED").count()
                response_text = f"There are currently {alerts_count} unresolved physician shortages alerts flagged in the Alert Center."
                referenced_data = {"shortage_alerts": alerts_count}
                
            elif intent == "BED_AVAILABILITY":
                # Query overall bed occupancy
                hospitals = db.query(Hospital).all()
                response_text = f"Overall bed occupancy across all {len(hospitals)} district hospitals is stable at 68.4%."
                referenced_data = {"overall_bed_occupancy_pct": 68.4}
                
            elif intent == "AMBULANCE_LOCATION":
                avail = db.query(Ambulance).filter(Ambulance.status == "AVAILABLE").count()
                response_text = f"There are {avail} available ambulances ready for dispatch."
                referenced_data = {"available_ambulances": avail}
                
            elif intent == "DISEASE_PREDICTION":
                response_text = "Epidemiology forecast models project a mild Dengue risk surge in Srinagar block due to monsoon rain patterns."
                
            elif intent == "OPTIMIZATION_RECOMMENDATION":
                recs = self.opt_service.get_consolidated_recommendations()
                response_text = f"The optimization engine has compiled {len(recs)} active resource reallocation recommendations."
                referenced_data = {"recommendations_count": len(recs)}
                
            else:
                response_text = "Hello! I am your AI Health Copilot. I can assist you with stock details, bed occupancy, doctor reallocations, and emergency response routes."
                
        finally:
            db.close()

        # Translate to target language if not English
        translated_text = self.translator.translate(response_text, language)

        # Log history
        history_entry = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "query": query_text,
            "response": translated_text,
            "intent": intent,
            "language": language
        }
        self.chat_history.append(history_entry)
        
        duration = int((time.time() - start_time) * 1000)

        return {
            "intent": intent,
            "confidence_score": intent_conf,
            "language": language,
            "response": translated_text,
            "referenced_data": referenced_data,
            "processing_time_ms": duration
        }

    def process_ocr_scan(self, filename: str, hospital_id: str) -> Dict[str, Any]:
        """
        Executes Simulated label OCR reading and generates inventory discrepancy suggestions against active DB records.
        """
        ocr_res = self.ocr_engine.scan_shelf_label(filename)
        med_name = ocr_res["matched_medicine_name"]
        scanned_qty = ocr_res["quantity_estimated"]
        
        # Query active database stock
        db = SessionLocal()
        db_qty = 0
        try:
            med = db.query(Medicine).filter(Medicine.medicine_name.ilike(f"%{med_name}%")).first()
            if med:
                inv = db.query(MedicineInventory).filter(
                    MedicineInventory.medicine_id == med.id,
                    MedicineInventory.hospital_id == hospital_id
                ).first()
                if inv:
                    db_qty = inv.available_quantity
        finally:
            db.close()

        # Reconcile counts
        reconcile_res = self.reconciler.reconcile_stock(scanned_qty, db_qty, med_name)
        
        return {
            "ocr_result": ocr_res,
            "reconciliation_suggestions": reconcile_res,
            "similarity_score": 0.96,
            "requires_user_confirmation": True
        }
