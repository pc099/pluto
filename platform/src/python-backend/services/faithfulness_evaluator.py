import os
import json
from typing import Dict, Any, List, Optional
from openai import AsyncOpenAI

class FaithfulnessEvaluator:
    """
    Evaluates the faithfulness of an LLM response to a given context using the LLM-as-a-judge pattern.
    Based on Datadog's approach: https://www.datadoghq.com/blog/ai/llm-hallucination-detection/
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            print("Warning: OPENAI_API_KEY not set. FaithfulnessEvaluator will not function.")
            self.client = None
        else:
            self.client = AsyncOpenAI(api_key=self.api_key)

    async def evaluate(self, question: str, context: str, answer: str) -> Dict[str, Any]:
        """
        Evaluates faithfulness using a two-step process:
        1. Generate reasoning and fill out a rubric (unstructured).
        2. Convert to structured output (JSON).
        """
        if not self.client:
            return {
                "score": 0.0,
                "reasoning": "Evaluator not initialized (missing API key)",
                "is_faithful": False,
                "contradictions": [],
                "unsupported_claims": []
            }

        # Step 1: Reasoning Generation
        reasoning_output = await self._generate_reasoning(question, context, answer)
        
        # Step 2: Structured Output
        verdict = await self._generate_structured_verdict(reasoning_output)
        
        return verdict

    async def _generate_reasoning(self, question: str, context: str, answer: str) -> str:
        prompt = f"""
You are an expert AI judge evaluating the faithfulness of an AI-generated answer to a given context.
Your task is to identify any hallucinations, which can be of two types:
1. Contradictions: Claims in the answer that directly contradict the context.
2. Unsupported Claims: Claims in the answer that are not found in the context (even if true in the real world).

Context (Expert Advice):
{context}

Question:
{question}

Candidate Answer:
{answer}

Instructions:
- Analyze the answer sentence by sentence.
- For each claim, check if it is supported by the context.
- If a claim contradicts the context, label it as a CONTRADICTION.
- If a claim is not found in the context, label it as UNSUPPORTED.
- If a claim is supported, label it as SUPPORTED.
- Provide a quote from the context and the answer for each disagreement.
- Be critical and rigorous.

Output your analysis below:
"""
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error in reasoning generation: {e}")
            return "Error generating reasoning."

    async def _generate_structured_verdict(self, reasoning: str) -> Dict[str, Any]:
        prompt = f"""
You are a parser. Your job is to convert the following reasoning into a structured JSON object.

Reasoning:
{reasoning}

Output Format (JSON):
{{
  "is_faithful": boolean, // True if there are no contradictions or unsupported claims
  "score": float, // 0.0 to 1.0 (1.0 = fully faithful, 0.0 = completely hallucinated)
  "contradictions": [
    {{
      "claim": "string",
      "context_quote": "string",
      "reason": "string"
    }}
  ],
  "unsupported_claims": [
    {{
      "claim": "string",
      "reason": "string"
    }}
  ],
  "summary": "string" // Brief summary of the evaluation
}}

Ensure the output is valid JSON.
"""
        try:
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Error in structured verdict generation: {e}")
            return {
                "is_faithful": False,
                "score": 0.0,
                "contradictions": [],
                "unsupported_claims": [],
                "summary": f"Error parsing verdict: {e}"
            }
