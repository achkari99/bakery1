// Invoice Generator for Golden Sweet Bakery
// Generates a beautiful invoice design and converts it to an image for WhatsApp

class InvoiceGenerator {
    constructor() {
        this.businessWhatsApp = '212600000000'; // Replace with your actual WhatsApp number (format: country code + number, no + or spaces)
    }

    async generateInvoice(customerInfo, cartItems, totals) {
        // Create invoice HTML
        const invoiceHTML = this.createInvoiceHTML(customerInfo, cartItems, totals);

        // Create a temporary container
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.innerHTML = invoiceHTML;
        document.body.appendChild(container);

        try {
            // Wait a bit for fonts to load
            await new Promise(resolve => setTimeout(resolve, 500));

            // Convert to canvas using html2canvas
            const canvas = await html2canvas(container.querySelector('.invoice-wrapper'), {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                width: 800,
                height: container.querySelector('.invoice-wrapper').scrollHeight
            });

            // Convert canvas to blob
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 1.0));

            // Clean up
            document.body.removeChild(container);

            return {
                blob,
                dataUrl: canvas.toDataURL('image/png'),
                invoiceNumber: this.generateInvoiceNumber()
            };
        } catch (error) {
            console.error('Error generating invoice:', error);
            document.body.removeChild(container);
            throw error;
        }
    }

    createInvoiceHTML(customerInfo, cartItems, totals) {
        const invoiceNumber = this.generateInvoiceNumber();
        const currentDate = new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        const itemsHTML = cartItems.map((item, index) => `
            <tr class="invoice-item">
                <td>${index + 1}</td>
                <td class="item-name">${item.name}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${item.price} MAD</td>
                <td class="text-right item-total">${item.price * item.quantity} MAD</td>
            </tr>
        `).join('');

        return `
            <div class="invoice-wrapper" style="width: 800px; background: #ffffff; font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                <style>
                    .invoice-wrapper * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    .invoice-container {
                        padding: 50px;
                        background: linear-gradient(135deg, #faf8f3 0%, #ffffff 100%);
                    }
                    .invoice-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 40px;
                        padding-bottom: 30px;
                        border-bottom: 3px solid #cd9f47;
                    }
                    .invoice-logo {
                        flex: 1;
                    }
                    .invoice-logo h1 {
                        font-size: 32px;
                        font-weight: 700;
                        color: #2c2416;
                        margin-bottom: 8px;
                        letter-spacing: 0.5px;
                    }
                    .invoice-logo p {
                        font-size: 14px;
                        color: #666;
                        line-height: 1.6;
                    }
                    .invoice-details {
                        text-align: right;
                    }
                    .invoice-number {
                        font-size: 16px;
                        font-weight: 700;
                        color: #cd9f47;
                        margin-bottom: 8px;
                    }
                    .invoice-date {
                        font-size: 14px;
                        color: #666;
                    }
                    .invoice-badge {
                        display: inline-block;
                        background: linear-gradient(135deg, #cd9f47, #dab76d);
                        color: white;
                        padding: 8px 20px;
                        border-radius: 25px;
                        font-size: 13px;
                        font-weight: 600;
                        margin-top: 10px;
                        letter-spacing: 0.5px;
                    }
                    .customer-section {
                        background: white;
                        border-radius: 12px;
                        padding: 25px;
                        margin-bottom: 30px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                        border-left: 4px solid #cd9f47;
                    }
                    .section-title {
                        font-size: 16px;
                        font-weight: 700;
                        color: #2c2416;
                        margin-bottom: 15px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .section-title::before {
                        content: '';
                        width: 6px;
                        height: 6px;
                        background: #cd9f47;
                        border-radius: 50%;
                    }
                    .customer-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                    }
                    .customer-field {
                        font-size: 14px;
                    }
                    .field-label {
                        color: #999;
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        margin-bottom: 4px;
                        font-weight: 600;
                    }
                    .field-value {
                        color: #2c2416;
                        font-weight: 500;
                        font-size: 14px;
                    }
                    .address-field {
                        grid-column: 1 / -1;
                    }
                    .items-table {
                        width: 100%;
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                        margin-bottom: 25px;
                    }
                    .items-table table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .items-table thead {
                        background: linear-gradient(135deg, #cd9f47, #dab76d);
                        color: white;
                    }
                    .items-table th {
                        padding: 15px;
                        text-align: left;
                        font-size: 13px;
                        font-weight: 700;
                        letter-spacing: 0.5px;
                        text-transform: uppercase;
                    }
                    .items-table td {
                        padding: 15px;
                        border-bottom: 1px solid #f0f0f0;
                        font-size: 14px;
                        color: #2c2416;
                    }
                    .invoice-item:last-child td {
                        border-bottom: none;
                    }
                    .item-name {
                        font-weight: 600;
                        color: #2c2416;
                    }
                    .item-total {
                        font-weight: 700;
                        color: #cd9f47;
                    }
                    .text-center {
                        text-align: center;
                    }
                    .text-right {
                        text-align: right;
                    }
                    .summary-section {
                        background: white;
                        border-radius: 12px;
                        padding: 25px;
                        margin-bottom: 30px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    }
                    .summary-line {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 0;
                        border-bottom: 1px solid #f0f0f0;
                        font-size: 14px;
                    }
                    .summary-line:last-child {
                        border-bottom: none;
                    }
                    .summary-label {
                        color: #666;
                        font-weight: 500;
                    }
                    .summary-value {
                        color: #2c2416;
                        font-weight: 600;
                    }
                    .total-line {
                        background: linear-gradient(135deg, #faf8f3, #fff5e6);
                        margin: 15px -25px -25px;
                        padding: 20px 25px;
                        border-radius: 0 0 12px 12px;
                        border-top: 2px solid #cd9f47;
                    }
                    .total-line .summary-label,
                    .total-line .summary-value {
                        font-size: 18px;
                        font-weight: 700;
                        color: #2c2416;
                    }
                    .total-line .summary-value {
                        color: #cd9f47;
                        font-size: 24px;
                    }
                    .invoice-footer {
                        text-align: center;
                        padding-top: 30px;
                        border-top: 2px solid #f0f0f0;
                        margin-top: 30px;
                    }
                    .footer-title {
                        font-size: 18px;
                        font-weight: 700;
                        color: #2c2416;
                        margin-bottom: 15px;
                    }
                    .footer-text {
                        font-size: 13px;
                        color: #666;
                        line-height: 1.8;
                        margin-bottom: 8px;
                    }
                    .footer-highlight {
                        color: #cd9f47;
                        font-weight: 600;
                    }
                </style>
                
                <div class="invoice-container">
                    <!-- Header -->
                    <div class="invoice-header">
                        <div class="invoice-logo">
                            <h1>🥐 Golden Sweet</h1>
                            <p>Pâtisserie Artisanale & Saine</p>
                            <p>Casablanca, Maroc</p>
                        </div>
                        <div class="invoice-details">
                            <div class="invoice-number">FACTURE #${invoiceNumber}</div>
                            <div class="invoice-date">${currentDate}</div>
                            <span class="invoice-badge">COMMANDE</span>
                        </div>
                    </div>

                    <!-- Customer Information -->
                    <div class="customer-section">
                        <div class="section-title">Informations Client</div>
                        <div class="customer-grid">
                            <div class="customer-field">
                                <div class="field-label">Nom Complet</div>
                                <div class="field-value">${customerInfo.name}</div>
                            </div>
                            <div class="customer-field">
                                <div class="field-label">Téléphone</div>
                                <div class="field-value">${customerInfo.phone}</div>
                            </div>
                            ${customerInfo.email ? `
                                <div class="customer-field">
                                    <div class="field-label">Email</div>
                                    <div class="field-value">${customerInfo.email}</div>
                                </div>
                            ` : ''}
                            <div class="customer-field address-field">
                                <div class="field-label">Adresse de Livraison</div>
                                <div class="field-value">${customerInfo.address}</div>
                            </div>
                            ${customerInfo.notes ? `
                                <div class="customer-field address-field">
                                    <div class="field-label">Instructions Spéciales</div>
                                    <div class="field-value">${customerInfo.notes}</div>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Items Table -->
                    <div class="items-table">
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 50px;">#</th>
                                    <th>Produit</th>
                                    <th class="text-center" style="width: 100px;">Quantité</th>
                                    <th class="text-right" style="width: 120px;">Prix Unit.</th>
                                    <th class="text-right" style="width: 120px;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHTML}
                            </tbody>
                        </table>
                    </div>

                    <!-- Summary -->
                    <div class="summary-section">
                        <div class="summary-line">
                            <span class="summary-label">Sous-total</span>
                            <span class="summary-value">${totals.subtotal} MAD</span>
                        </div>
                        <div class="summary-line">
                            <span class="summary-label">Livraison</span>
                            <span class="summary-value">${totals.delivery === 0 ? 'Gratuite' : totals.delivery + ' MAD'}</span>
                        </div>
                        <div class="total-line">
                            <div class="summary-line">
                                <span class="summary-label">TOTAL À PAYER</span>
                                <span class="summary-value">${totals.total} MAD</span>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="invoice-footer">
                        <div class="footer-title">Merci pour votre commande ! 🎉</div>
                        <p class="footer-text">Nous préparons votre commande avec soin.</p>
                        <p class="footer-text">Pour toute question : <span class="footer-highlight">contact@goldensweet.ma</span></p>
                        <p class="footer-text" style="margin-top: 15px; font-size: 12px; color: #999;">
                            Golden Sweet - Pâtisserie Artisanale & Saine
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    generateInvoiceNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `GS${year}${month}${day}${random}`;
    }

    async sendToWhatsApp(invoiceData, customerInfo, totals) {
        // First download the invoice image for the user
        this.downloadInvoice(invoiceData.dataUrl, invoiceData.invoiceNumber);

        // Wait a moment for download to start
        await new Promise(resolve => setTimeout(resolve, 500));

        // Create WhatsApp message
        const message = this.createWhatsAppMessage(customerInfo, totals, invoiceData.invoiceNumber);

        // Open WhatsApp Web with the message
        const whatsappUrl = `https://wa.me/${this.businessWhatsApp}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        return {
            success: true,
            message: 'Invoice downloaded and WhatsApp opened',
            invoiceNumber: invoiceData.invoiceNumber
        };
    }

    createWhatsAppMessage(customerInfo, totals, invoiceNumber) {
        // Use simple ASCII characters to avoid encoding issues
        const lines = [
            'NOUVELLE COMMANDE - Golden Sweet',
            '',
            'Facture: #' + invoiceNumber,
            '',
            'Client: ' + customerInfo.name,
            'Telephone: ' + customerInfo.phone,
            'Adresse: ' + customerInfo.address
        ];

        if (customerInfo.notes) {
            lines.push('Notes: ' + customerInfo.notes);
        }

        lines.push('');
        lines.push('Montant Total: ' + totals.total + ' MAD');
        lines.push('Livraison: ' + (totals.delivery === 0 ? 'Gratuite' : totals.delivery + ' MAD'));
        lines.push('');
        lines.push('---');
        lines.push('IMPORTANT: Veuillez joindre la facture telechargee');
        lines.push('(fichier PNG) a ce message avant d\'envoyer.');

        return lines.join('\n');
    }

    downloadInvoice(dataUrl, invoiceNumber) {
        try {
            // Convert data URL to blob for better handling
            const arr = dataUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            const blob = new Blob([u8arr], { type: mime });

            // Create object URL from blob
            const blobUrl = URL.createObjectURL(blob);

            // Create download link
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `GoldenSweet-Facture-${invoiceNumber}.png`;
            link.style.display = 'none';

            // Trigger download
            document.body.appendChild(link);
            link.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);
            }, 100);
        } catch (error) {
            console.error('Error downloading invoice:', error);
            // Fallback to simple download
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `GoldenSweet-Facture-${invoiceNumber}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    setBusinessWhatsApp(number) {
        this.businessWhatsApp = number;
    }
}

// Export for use in other scripts
window.InvoiceGenerator = InvoiceGenerator;
