// import React, { useState } from 'react';
// import QRCode from 'qrcode.react'; // npm install qrcode.react
// import axios from 'axios';

// function App() {
//   const [qrCode, setQrCode] = useState('');
//   const [amount, setAmount] = useState(10000);

//   const generateQR = async () => {
//     try {
//       // Panggil backend Anda, jangan panggil BRIAPI langsung
//       const response = await axios.post('/api/generate-qris', {
//         amount: amount,
//         orderId: 'ORDER' + Date.now(),
//       });
//       setQrCode(response.data.qrContent); // qrContent dari BRI
//     } catch (error) {
//       console.error('Error generating QR', error);
//     }
//   };

//   return (
//     <div>
//       <h1>Bayar dengan QRIS BRI</h1>
//       <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
//       <button onClick={generateQR}>Generate QRIS</button>
//       {qrCode && (
//         <div style={{ marginTop: '20px' }}>
//           <QRCode value={qrCode} size={256} />
//           <p>Scan QR di atas dengan BRImo atau aplikasi e-wallet</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
