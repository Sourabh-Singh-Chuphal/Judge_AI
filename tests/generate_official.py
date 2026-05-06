from generate_samples import create_sample_pdf


def create_official_pdf():
    content = [
        "REPORTABLE",
        "IN THE SUPREME COURT OF INDIA",
        "CRIMINAL APPELLATE JURISDICTION",
        "CRIMINAL APPEAL NO. 2232 OF 2016",
        "",
        "SHARAT BABU DIGUMARTI ... APPELLANT",
        "VERSUS",
        "GOVERNMENT OF NCT OF DELHI ... RESPONDENT",
        "",
        "JUDGMENT DATE: 2016-12-14",
        "",
        "JUDGMENT",
        "",
        "Dipak Misra, J.",
        "The appellant was the Senior Manager (Performance Production) of M/s. Bazee.com India Pvt. Ltd. The core issue involves prosecution under Section 67 of the Information Technology Act, 2000 versus Section 292 of the Indian Penal Code.",
        "",
        "COURT FINDINGS:",
        "Once the special statute covers the field, the general law shall not be invoked. The legislative intent was to provide a specific framework for electronic records.",
        "",
        "DIRECTIVE:",
        "The order passed by the High Court of Delhi is set aside. The criminal proceedings against the appellant under Section 292 of the IPC are hereby quashed. The respondent is directed to ensure that the electronic records are returned to the appellant within 30 days.",
        "",
        "The State Government is further directed to issue a circular to all police stations clarifying the primacy of the IT Act in cases of electronic records within 90 days of this order.",
        "",
        "Compliance Deadline: 2017-03-14",
        "",
        "IT IS SO ORDERED.",
    ]
    create_sample_pdf("official_test_case.pdf", content)


if __name__ == "__main__":
    create_official_pdf()
