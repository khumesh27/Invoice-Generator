// Admin Login
function login(event) {
    event.preventDefault();
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (username === "admin" && password === "admin123") {
        localStorage.setItem("isAdmin", true);
        window.location.href = "dashboard.html";
    } else {
        document.getElementById("error-msg").innerText = "Invalid credentials!";
    }
}

// Logout
function logout() {
    localStorage.removeItem("isAdmin");
    window.location.href = "index.html";
}

// Check Admin Access
document.addEventListener("DOMContentLoaded", function () {
    if (!localStorage.getItem("isAdmin")) {
        window.location.href = "index.html";
    }
});

// Add Customer
let customers = [];

function addCustomer(event) {
    event.preventDefault();

    let name = document.getElementById("customer-name").value;
    let mobile = document.getElementById("mobile").value;
    let address = document.getElementById("address").value;
    let gst = document.getElementById("gst").value;
    let currentReading = parseFloat(document.getElementById("current-reading").value);

    let customer = { name, mobile, address, gst, currentReading };
    customers.push(customer);

    updateCustomerList();
    alert("Customer added successfully!");
}

// Update Customer List for Invoice
function updateCustomerList() {
    let select = document.getElementById("customer-list");
    select.innerHTML = "";
    customers.forEach((customer, index) => {
        let option = document.createElement("option");
        option.value = index;
        option.textContent = customer.name;
        select.appendChild(option);
    });
}

// Generate Invoice
function generateInvoice(event) {
    event.preventDefault();

    let customerIndex = document.getElementById("customer-list").value;
    let previousReading = parseFloat(document.getElementById("previous-reading").value);
    let rent = parseFloat(document.getElementById("rent").value);
    let freeCopies = parseFloat(document.getElementById("free-copies").value);
    let rate = parseFloat(document.getElementById("rate").value);
    let gstType = document.getElementById("gst-type").value;

    let customer = customers[customerIndex];

    let netPayableReading = customer.currentReading - previousReading - freeCopies;
    let totalT1 = netPayableReading * rate + rent;

    let gstAmount = 0;
    if (gstType === "cgst") {
        let cgst = totalT1 * 0.09; // 9% CGST
        let sgst = totalT1 * 0.09; // 9% SGST
        gstAmount = cgst + sgst;  // Total 18% (9% + 9%)
    } else if (gstType === "igst") {
        gstAmount = totalT1 * 0.18; // IGST 18%
    }

    let totalAmount = totalT1 + gstAmount;

    // Generate Invoice Layout
    let invoiceHTML = `
        <div id="invoice">
            <h1 style="text-align: center;">INVOICE</h1>
            <hr>
            <table width="100%">
                <tr>
                    <td><strong>ISSUED TO:</strong><br>${customer.name}<br>${customer.address}<br></td>
                    <td style="text-align:right;"><strong>INVOICE NO:</strong> 01234<br><strong>DATE:</strong> ${new Date().toLocaleDateString()}<br></td>
                </tr>
            </table>
            <hr>
            <table width="100%" border="1" cellspacing="0" cellpadding="5">
                <tr>
                    <th>DESCRIPTION</th>
                    <th>UNIT PRICE</th>
                    <th>QTY</th>
                    <th>TOTAL</th>
                </tr>
                <tr>
                    <td>Electricity Bill</td>
                    <td>${rate.toFixed(2)}</td>
                    <td>${netPayableReading}</td>
                    <td>${totalT1.toFixed(2)}</td>
                </tr>
                <tr>
                    <td colspan="3"><strong>SUBTOTAL</strong></td>
                    <td>${totalT1.toFixed(2)}</td>
                </tr>
                <tr>
                    <td colspan="3"><strong>GST (${gstType.toUpperCase()})</strong></td>
                    <td>${gstAmount.toFixed(2)}</td>
                </tr>
                <tr>
                    <td colspan="3"><strong>TOTAL</strong></td>
                    <td><strong>${totalAmount.toFixed(2)}</strong></td>
                </tr>
            </table>
            <br>
            <p style="text-align: center;"><strong>Signature:</strong> _______________</p>
        </div>
    `;

    document.getElementById("invoice-result").innerHTML = invoiceHTML;
    document.getElementById("download-invoice").style.display = "block";
}

// Download Invoice as PDF
function downloadInvoice() {
    let invoiceElement = document.getElementById("invoice"); // Get the invoice div

    html2canvas(invoiceElement, { scale: 2 }).then(canvas => {
        let imgData = canvas.toDataURL("image/png");
        let pdf = new jsPDF("p", "mm", "a4");

        let imgWidth = 190; // Adjust width to fit A4
        let imgHeight = (canvas.height * imgWidth) / canvas.width; // Keep aspect ratio

        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
        pdf.save("invoice.pdf");
    }).catch(error => {
        console.error("Error generating PDF:", error);
    });
}

