document.getElementById('searchBtn').addEventListener('click', function() {
    const sku = document.getElementById('skuInput').value.trim();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    if (!sku) {
        resultDiv.innerHTML = '<div class="error">กรุณากรอกเลข SKU</div>';
        return;
    }
    // แสดงข้อความกำลังตรวจสอบข้อมูล
    resultDiv.innerHTML = '<div class="loading" style="color:#f76b1c;font-weight:bold;margin-top:24px;">กำลังตรวจสอบข้อมูล...</div>';
    fetch('/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku })
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then(res => {
        // ลบข้อความ loading แล้วแสดงผลลัพธ์
        if (res.status === 200 && res.body.data && res.body.data.length > 0) {
            // กำหนดลำดับคอลัมน์ที่ต้องการ
            const columnOrder = [
                'mp_sku_id',
                'name',
                'shopid',
                'production_date',
                'expiration_date',
                'location_type'
            ];
            // ตรวจสอบว่ามีคอลัมน์ไหนในข้อมูลบ้าง
            const keys = columnOrder.filter(k => k in res.body.data[0]);
            let table = '<table class="result-table"><colgroup>';
            // กำหนดความกว้างแต่ละคอลัมน์ (responsive)
            table += '<col style="width:18%;text-align:left;">'; // mp_sku_id
            table += '<col style="width:22%;">'; // name
            table += '<col style="width:14%;">'; // shopid
            table += '<col style="width:14%;">'; // production_date
            table += '<col style="width:18%;">'; // expiration_date
            table += '<col style="width:14%;">'; // location_type
            table += '</colgroup><thead><tr>';
            keys.forEach((k, idx) => {
                table += `<th style="${idx === 0 ? 'text-align:left;' : ''}">${k}</th>`;
            });
            table += '</tr></thead><tbody>';
            res.body.data.forEach(row => {
                table += '<tr>';
                keys.forEach((k, idx) => {
                    let value = row[k] ?? '';
                        if ((k === 'production_date' || k === 'expiration_date') && value) {
                            // แสดงเฉพาะวันที่และแปลงเป็น dd/mmm/yyyy
                            let datePart = value.split(' ')[0];
                            const [yyyy, mm, dd] = datePart.split('-');
                            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            let mmm = '';
                            if (mm && Number(mm) >= 1 && Number(mm) <= 12) {
                                mmm = monthNames[Number(mm) - 1];
                            }
                            if (dd && mmm && yyyy) {
                                value = `${dd}/${mmm}/${yyyy}`;
                            } else {
                                value = datePart;
                            }
                        }
                    table += `<td style="${idx === 0 ? 'text-align:left;font-weight:500;' : ''}">${value}</td>`;
                });
                table += '</tr>';
            });
            table += '</tbody></table>';
            resultDiv.innerHTML = table;
        } else {
            resultDiv.innerHTML = `<div class=\"error\">${res.body.error || 'ไม่พบข้อมูล'}</div>`;
        }
    })
    .catch(err => {
        resultDiv.innerHTML = `<div class="error">เกิดข้อผิดพลาด: ${err}</div>`;
    });
});
