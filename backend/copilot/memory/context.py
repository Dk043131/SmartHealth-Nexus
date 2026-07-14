from typing import List, Dict, Any

class ConversationMemory:
    def __init__(self):
        self._history = []

    def save_message(self, user_query: str, ai_response: str, intent: str, confidence: float):
        self._history.append({
            "timestamp": float(time_to_sec()) if 'time_to_sec' in globals() else 1719888000,
            "query": user_query,
            "response": ai_response,
            "intent": intent,
            "confidence": confidence
        })

    def get_history(self) -> List[Dict[str, Any]]:
        return self._history
