import asyncio
import os
import sys
from datetime import datetime

# Add current directory to path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.database_service import db_service
from services.compliance_native_monitoring import ComplianceNativeMonitor
from services.faithfulness_evaluator import FaithfulnessEvaluator

async def verify_database():
    print("\n--- Verifying Database Service ---")
    try:
        # This should check if Supabase client is initialized
        if db_service.supabase:
            print("✅ DatabaseService initialized with Supabase client.")
        else:
            print("❌ DatabaseService failed to initialize Supabase client (check env vars).")
            
        # Try to fetch agents (should fail if no real connection)
        agents = db_service.get_agents()
        print(f"✅ Successfully fetched {len(agents)} agents (or empty list).")
    except Exception as e:
        print(f"❌ Database verification failed: {e}")

async def verify_compliance():
    print("\n--- Verifying Compliance Service ---")
    monitor = ComplianceNativeMonitor()
    
    # Sample data for EU AI Act
    ai_system_data = {
        "risk_classification": "High-Risk",
        "data_governance": True,
        "technical_documentation": True,
        "human_oversight": True,
        "lawful_basis": "Consent",
        "data_minimization": True,
        "privacy_notice": True,
        "data_subject_rights": True
    }
    
    try:
        # Verify EU AI Act
        eu_result = await monitor._assess_eu_ai_act_compliance(ai_system_data)
        if eu_result['status'] == 'compliant':
            print("✅ EU AI Act assessment logic verified (Compliant).")
        else:
            print(f"⚠️ EU AI Act assessment returned: {eu_result['status']}")
            
        # Verify GDPR
        gdpr_result = await monitor._assess_gdpr_compliance(ai_system_data)
        if gdpr_result['status'] == 'compliant':
            print("✅ GDPR assessment logic verified (Compliant).")
        else:
            print(f"⚠️ GDPR assessment returned: {gdpr_result['status']}")
            
    except Exception as e:
        print(f"❌ Compliance verification failed: {e}")

async def verify_faithfulness():
    print("\n--- Verifying Faithfulness Evaluator ---")
    evaluator = FaithfulnessEvaluator()
    if evaluator.client:
        print("✅ FaithfulnessEvaluator initialized with OpenAI client.")
    else:
        print("⚠️ FaithfulnessEvaluator initialized without API key (expected if OPENAI_API_KEY not set).")

async def main():
    print("Starting Backend Verification...")
    await verify_database()
    await verify_compliance()
    await verify_faithfulness()
    print("\nVerification Complete.")

if __name__ == "__main__":
    asyncio.run(main())
