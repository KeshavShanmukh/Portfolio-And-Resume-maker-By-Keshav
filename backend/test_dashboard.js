const fetch = globalThis.fetch || require('node-fetch');
(async ()=>{
  try{
    // Use login to get token
    const login = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'tester_js@example.com', password: 'password123' })
    });
    const data = await login.json();
    const token = data.token;

    const res = await fetch('http://localhost:4000/api/dashboard', {
      method: 'GET', headers: { Authorization: `Bearer ${token}` }
    });
    console.log('STATUS', res.status);
    console.log(await res.text());
  }catch(e){console.error(e)}
})();
