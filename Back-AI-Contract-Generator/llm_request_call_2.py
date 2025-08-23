import google.generativeai as genai
import os
import logging

from aws_lambda_powertools.utilities.parameters import get_secret
from pydantic import BaseModel

logger = logging.getLogger(__name__)
logger.setLevel(os.getenv("LOG_LEVEL", "DEBUG"))

END_OF_TEXT = ""
TOKEN_LIMIT = 100000

try:
    API_KEY = get_secret("ai-contract-generator-keys", transform='json')['GEMINI_API_KEY']
    logger.info("GEMINI_API_KEY fetched from AWS")
except Exception as e:
    API_KEY = os.getenv("GEMINI_API_KEY") 
    logger.info("GEMINI_API_KEY fetched from envirnoment variable")
    if not API_KEY:
        logger.error("GEMINI_API_KEY was not found")
        exit()


class Prompt(BaseModel):
    prompt: str
    
class TermsOfService:
    def __init__(self, prompt:Prompt):
        self.user_prompt = prompt.prompt
        self.token_counter:int = 0
        self.invocations_counter:int = 0
        
        genai.configure(api_key=API_KEY)
        self.model:genai.GenerativeModel = genai.GenerativeModel('gemini-2.0-flash')
        self.messages = []
        
    def _execute_query_stream(self, new_prompt: str):
        """An generator that executes a query, manages history, and streams the response."""
        self.messages.append({'role': 'user', 'parts': [new_prompt]})

        # Check token count before making the API call.
        self.token_counter = self.model.count_tokens(self.messages).total_tokens
        if self.token_counter > TOKEN_LIMIT:
            logger.exception(f"token limit reached: {self.token_counter}")
            raise Exception(f"Token limit reached: {self.token_counter}")

        # Use the asynchronous, streaming version of the API, passing the full history.
        response = self.model.generate_content(self.messages, stream=True)
        self.invocations_executed += 1
        logger.info(
            f"Invocations executed: {self.invocations_counter}"
            f"Tokens utilized: {self.token_counter}"
        )
        
        # Yield chunks as they are received.
        for chunk in response:
            yield chunk.text

        # After streaming is complete, add the full model response to the history.
        self.messages.append(response.candidates[0].content)

    def _execute_query(self, prompt: str):
        """Executes a non-streaming query and returns the full text."""
        # Collect all parts from the async generator.
        return "".join([part for part in self._execute_query_stream(prompt)])

    # --- Streaming API Call ---
    def generate_text_stream(self):
        """
// Mock Contract Data - A comprehensive Terms of Service document
const MOCK_CONTRACT_SECTIONS = [
    { title: "1. Introduction", content: "<p>Welcome to SaaS Corp. These Terms of Service ('Terms') govern your use of our cloud cybersecurity software-as-a-service platform ('Service'). By accessing or using our Service, you agree to be bound by these Terms and our Privacy Policy. If you are using the Service on behalf of an organization, you are agreeing to these Terms for that organization and promising that you have the authority to bind that organization to these terms. In that case, 'you' and 'your' will refer to that organization.</p>" },
    { title: "2. Definitions", content: "<p><strong>'Service'</strong> means the cloud cybersecurity SaaS platform provided by SaaS Corp. <strong>'Customer Data'</strong> means all electronic data or information submitted by you to the Service. <strong>'User'</strong> means an individual authorized by you to use the Service. <strong>'Subscription Term'</strong> means the period during which you have agreed to subscribe to the Service.</p>" },
    { title: "3. Use of Service", content: "<h3>3.1. License Grant</h3><p>Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, non-sublicensable license to use the Service for your internal business purposes during the Subscription Term.</p><h3>3.2. Acceptable Use</h3><p>You agree not to (a) misuse our Service, (b) resell or white-label the Service, (c) use the Service to store or transmit infringing, libelous, or otherwise unlawful or tortious material, or to store or transmit material in violation of third-party privacy rights, (d) use the Service to store or transmit malicious code, or (e) attempt to gain unauthorized access to the Service or its related systems or networks.</p>" },
    { title: "4. Customer Data", content: "<p>You retain all right, title, and interest in and to your Customer Data. You grant us a worldwide, limited-term license to host, copy, transmit, and display your Customer Data as necessary for us to provide the Service in accordance with these Terms. We will maintain administrative, physical, and technical safeguards for the protection of the security, confidentiality, and integrity of your Customer Data.</p>" },
    { title: "5. Fees and Payment", content: "<h3>5.1. Subscription Fees</h3><p>You will pay all fees specified in your order form. Except as otherwise specified herein, (i) fees are based on services purchased and not actual usage, (ii) payment obligations are non-cancelable and fees paid are non-refundable, and (iii) quantities purchased cannot be decreased during the relevant subscription term.</p><h3>5.2. Invoicing and Payment</h3><p>Fees will be invoiced in advance and otherwise in accordance with the relevant order form. Unless otherwise stated, invoiced charges are due net 30 days from the invoice date. You are responsible for providing complete and accurate billing and contact information to us and notifying us of any changes to such information.</p><h3>5.3. Taxes</h3><p>Our fees do not include any taxes, levies, duties or similar governmental assessments of any nature, including, for example, value-added, sales, use or withholding taxes, assessable by any jurisdiction whatsoever (collectively, 'Taxes'). You are responsible for paying all Taxes associated with your purchases hereunder.</p>" },
    { title: "6. Confidentiality", content: "<p><strong>'Confidential Information'</strong> means all information disclosed by a party ('Disclosing Party') to the other party ('Receiving Party'), whether orally or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure. The Receiving Party will use the same degree of care that it uses to protect the confidentiality of its own confidential information of like kind (but not less than reasonable care) and agrees (i) not to use any Confidential Information of the Disclosing Party for any purpose outside the scope of this agreement, and (ii) except as otherwise authorized by the Disclosing Party in writing, to limit access to Confidential Information of the Disclosing Party to those of its and its affiliates’ employees and contractors who need that access for purposes consistent with this agreement and who have signed confidentiality agreements with the Receiving Party containing protections no less stringent than those herein.</p>" },
    { title: "7. Warranties and Disclaimers", content: "<h3>7.1. Our Warranties</h3><p>We warrant that the Service will perform materially in accordance with the applicable documentation. For any breach of a warranty above, your exclusive remedy shall be as provided in Section 10 (Termination).</p><h3>7.2. Disclaimers</h3><p>EXCEPT AS EXPRESSLY PROVIDED HEREIN, NEITHER PARTY MAKES ANY WARRANTY OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY OR OTHERWISE, AND EACH PARTY SPECIFICALLY DISCLAIMS ALL IMPLIED WARRANTIES, INCLUDING ANY IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE OR NON-INFRINGEMENT, TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW.</p>" },
    { title: "8. Limitation of Liability", content: "<p>IN NO EVENT SHALL EITHER PARTY'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT EXCEED THE TOTAL AMOUNT PAID BY YOU HEREUNDER IN THE 12 MONTHS PRECEDING THE FIRST INCIDENT OUT OF WHICH THE LIABILITY AROSE. THE FOREGOING LIMITATION WILL APPLY WHETHER AN ACTION IS IN CONTRACT OR TORT AND REGARDLESS OF THE THEORY OF LIABILITY.</p><p>IN NO EVENT WILL EITHER PARTY HAVE ANY LIABILITY TO THE OTHER PARTY FOR ANY LOST PROFITS, REVENUES OR INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, COVER OR PUNITIVE DAMAGES, WHETHER AN ACTION IS IN CONTRACT OR TORT AND REGARDLESS OF THE THEORY OF LIABILITY, EVEN IF A PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>" },
    { title: "9. Term and Termination", content: "<h3>9.1. Term of Agreement</h3><p>This Agreement commences on the date you first accept it and continues until all subscription terms hereunder have expired or have been terminated.</p><h3>9.2. Termination for Cause</h3><p>A party may terminate this Agreement for cause (i) upon 30 days written notice to the other party of a material breach if such breach remains uncured at the expiration of such period, or (ii) if the other party becomes the subject of a petition in bankruptcy or any other proceeding relating to insolvency, receivership, liquidation or assignment for the benefit of creditors.</p><h3>9.3. Effect of Termination</h3><p>Upon any termination for cause by you, we will refund you any prepaid fees covering the remainder of the term of all order forms after the effective date of termination. Upon any termination for cause by us, you will pay any unpaid fees covering the remainder of the term of all order forms.</p>" },
    { title: "10. Governing Law and Jurisdiction", content: "<p>This Agreement shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of laws principles. The parties agree that the state and federal courts located in New York County, New York shall have exclusive jurisdiction to adjudicate any dispute arising out of or relating to this Agreement.</p>" },
    { title: "11. General Provisions", content: "<h3>11.1. Entire Agreement</h3><p>This Agreement is the entire agreement between you and us regarding the subject matter of this Agreement. This Agreement supersedes all prior or contemporaneous representations, understandings, agreements, or communications between you and us, whether written or verbal, regarding the subject matter of this Agreement.</p><h3>11.2. Assignment</h3><p>Neither party may assign any of its rights or obligations hereunder, whether by operation of law or otherwise, without the other party’s prior written consent (not to be unreasonably withheld).</p><h3>11.3. Notices</h3><p>Any notice or other communication to be given hereunder will be in writing and given by postpaid registered or certified mail return receipt requested, or electronic mail.</p>" },
    { title: "12. Contact Information", content: "<p>If you have any questions about these Terms, please contact us at legal@saascorp.com.</p><p><strong>SaaS Corp.</strong><br>123 Tech Avenue<br>New York, NY 10001<br>USA</p>" }
];

        """
        
        # define a list of TermsOfService points
        first_prompt = \
            f""" 
            Create a list of 12 short points for the Terms of Service document of the following business context: 
            {self.user_prompt}.
            
            use the 2 following sites as examples: 
                • https://www.perplexity.ai/hub/legal/terms-of-service
                • https://www.zoom.com/en/trust/terms/ 
            
            You should return flat Text only, compose the list of points only, each point should be separated by the character '#'.
            """
        list_of_points = self._execute_query(first_prompt)
        
        # write the first intrudction
        intro_prompt = \
            f"""
            write an introduction for the Terms of Service document based on this draft:
            {self.user_prompt}
            The output must be in well-structured HTML format.
            
            use the 2 following sites as examples: 
                • https://www.perplexity.ai/hub/legal/terms-of-service
                • https://www.zoom.com/en/trust/terms/ 
            """

        for chunk in self._execute_query_stream(intro_prompt):
            chunk = chunk.removeprefix('```html').removesuffix('```')
            yield chunk
        
        # execute for each query for each point
        for point in list_of_points.split("#"):
            second_prompt = \
                f"""
                Continue with the same structure used until now, 
                work on the following point of the Terms of Service:
                {point} 
                based on the user draft: {self.user_prompt}
                
                The output must be in well-structured HTML format.
                
                use the 2 following sites as examples: 
                    • https://www.perplexity.ai/hub/legal/terms-of-service
                    • https://www.zoom.com/en/trust/terms/ 
                """
            for chunk in self._execute_query_stream(second_prompt):
                chunk = chunk.removeprefix('```html').removesuffix('```')
                yield chunk

        yield END_OF_TEXT

    
    