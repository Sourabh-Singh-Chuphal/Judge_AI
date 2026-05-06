import os
import textwrap

import fitz


def create_sample_pdf(filename, content):
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    y = 56

    for line in content:
        wrapped = textwrap.wrap(line, width=92) if line else [""]
        for part in wrapped:
            if y > 780:
                page = doc.new_page(width=595, height=842)
                y = 56
            if part:
                page.insert_text((56, y), part, fontsize=11, fontname="helv", color=(0, 0, 0))
            y += 17
        if line.endswith(":"):
            y += 4

    os.makedirs("tests/samples", exist_ok=True)
    doc.save(f"tests/samples/{filename}", deflate=True, garbage=4)
    doc.close()
    print(f"Created {filename}")


case_1 = [
    "IN THE HIGH COURT OF KARNATAKA AT BENGALURU",
    "WRIT PETITION NO. 45678 OF 2024",
    "",
    "Petitioner: SRI ANAND RAO",
    "Respondent: STATE OF KARNATAKA AND OTHERS",
    "",
    "JUDGMENT DATE: 2024-04-10",
    "",
    "FACTS OF THE CASE:",
    "The petitioner is the owner of land in Survey No. 12/A of Hebbal Village. The petitioner has applied for mutation of records following the death of his father in 2022. Despite several reminders, the Revenue Department has failed to process the request, citing administrative backlog.",
    "",
    "COURT OBSERVATIONS:",
    "This Court finds that the Right to Property is a constitutional right. Delay in mutation for over 2 years is unacceptable and violates the principles of good governance. The respondent department is obligated to provide services in a timely manner.",
    "",
    "FINAL DIRECTIVE:",
    "The Tahsildar, Bengaluru North, is directed to complete the mutation process within 60 days from today. The department must ensure that all encumbrances are checked and the RTC is updated in the name of the petitioner. A compliance report shall be filed before the Registrar of this Court within 15 days of the expiry of the deadline.",
    "",
    "IT IS SO ORDERED.",
    "",
    "Compliance Deadline: 2024-06-10",
]

case_2 = [
    "SUPREME COURT OF INDIA",
    "CIVIL APPEAL NO. 1122 OF 2024",
    "",
    "Appellant: KUMARI MEENA",
    "Respondent: UNION OF INDIA",
    "",
    "JUDGMENT DATE: 2024-05-01",
    "",
    "The appellant challenges the termination of services in the Ministry of Defence.",
    "The Court finds the termination order violates principles of natural justice.",
    "",
    "DIRECTIVE: The respondent is directed to reinstate the appellant with 50% back wages within 30 days.",
    "The Ministry of Defence must issue the appointment order immediately.",
    "",
    "Compliance Deadline: 2024-05-31",
]

case_3 = [
    "NATIONAL GREEN TRIBUNAL",
    "O.A. NO. 99 OF 2024",
    "",
    "Applicant: GREEN PEACE FOUNDATION",
    "Respondent: M/S POLLUTION CORP",
    "",
    "JUDGMENT DATE: 2024-03-20",
    "",
    "The applicant highlights the discharge of untreated effluents into the Ganga river.",
    "The Tribunal orders the immediate closure of the unit until ETP is operational.",
    "",
    "DIRECTIVE: The company is directed to pay a penalty of INR 5,00,000 to the Environment Relief Fund within 90 days.",
    "The State Pollution Control Board must inspect the site and certify compliance.",
    "",
    "Compliance Deadline: 2024-06-20",
]

if __name__ == "__main__":
    create_sample_pdf("land_dispute_case.pdf", case_1)
    create_sample_pdf("service_matter_case.pdf", case_2)
    create_sample_pdf("environmental_penalty_case.pdf", case_3)
