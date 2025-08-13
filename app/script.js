document.addEventListener("DOMContentLoaded", function () {
    let allLeads = [];

    ZohoEmbeddedApp.init().then(function () {
        document.getElementById("status").innerText = "Fetching leads...";
        fetchAllLeads(1); // start from page 1
    });

    function fetchAllLeads(page) {
        console.log("Fetching page:", page);
        ZohoCRM.API.getAllRecords({
            Entity: "Leads",
            sort_order: "asc",
            per_page: 200,
            page: page
        }).then(function (response) {
            if (response.data && response.data.length > 0) {
                allLeads = allLeads.concat(response.data);

                // If more records, fetch next page
                if (response.info && response.info.more_records) {
                    fetchAllLeads(page + 1);
                } else {
                    processEmailDomains();
                }
            } else {
                processEmailDomains();
            }
        }).catch(function (err) {
            document.getElementById("status").innerText = "Error fetching leads.";
            console.error("Error fetching leads", err);
        });
    }

    function processEmailDomains() {
        document.getElementById("status").innerText = "Processing domains...";

        let domainCount = {};

        allLeads.forEach(function (lead) {
            if (lead.Email) {
                let domain = lead.Email.split("@")[1]?.toLowerCase();
                if (domain) {
                    domainCount[domain] = (domainCount[domain] || 0) + 1;
                }
            }
        });

        displayResults(domainCount);
    }

    function displayResults(domainCount) {
        document.getElementById("status").innerText = "";

        let html = "<table><tr><th>Domain</th><th>Count</th></tr>";

        Object.keys(domainCount)
            .sort((a, b) => domainCount[b] - domainCount[a])
            .forEach(function (domain) {
                html += `<tr><td>${domain}</td><td>${domainCount[domain]}</td></tr>`;
            });

        html += "</table>";

        document.getElementById("results").innerHTML = html;
    }
});
