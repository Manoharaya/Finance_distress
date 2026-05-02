import structlog

logger = structlog.get_logger()

class ABNParser:
    @staticmethod
    def parse_abn_response(response_json: dict):
        """
        Parses the JSON response from ABN Lookup API.
        """
        try:
            return {
                "abn": response_json.get("Abn"),
                "entity_status": response_json.get("EntityStatus"),
                "gst_status": response_json.get("GstStatus"),
                "registration_date": response_json.get("RegistrationDate"),
                "name": response_json.get("EntityName")
            }
        except Exception as e:
            logger.error("Failed to parse ABN response", error=str(e))
            return None
