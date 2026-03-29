from flask import Flask, render_template, request, jsonify
import pandas as pd
import os

app = Flask(__name__)


# Path to the Excel file
data_file = os.path.join(os.path.dirname(__file__), 'sbs_expiry_tracker_2026-03-28.xlsx')


# โหลดข้อมูล Excel ไว้ใน memory ตอนเริ่มต้น server (เช็คว่ามีไฟล์ก่อน)
df_cache = None
if os.path.exists(data_file):
    try:
        df_cache = pd.read_excel(data_file, dtype=str)
    except Exception as e:
        print(f"Error loading Excel file: {e}")
else:
    print("Excel file not found. Running in mock/demo mode.")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    sku = request.json.get('sku')
    if not sku:
        return jsonify({'error': 'No SKU provided'}), 400
    try:
        if df_cache is None:
            # ถ้าไม่มีไฟล์ Excel ให้ตอบ mock data (หรือจะเปลี่ยนเป็น [] ก็ได้)
            mock_data = [
                {
                    'mp_sku_id': 'MOCKSKU001',
                    'name': 'Demo Product',
                    'shopid': 'SHOP123',
                    'production_date': '2026-01-01',
                    'expiration_date': '2027-01-01',
                    'location_type': 'DEMO'
                }
            ]
            return jsonify({'data': mock_data})
        # ค้นหาจาก DataFrame ที่ cache ไว้
        result = df_cache[df_cache.apply(lambda row: row.astype(str).str.contains(sku, case=False).any(), axis=1)]
        if result.empty:
            return jsonify({'error': 'SKU not found'}), 404
        # Convert result to dict
        data = result.to_dict(orient='records')
        return jsonify({'data': data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
