const fetch = globalThis.fetch || require('node-fetch');
(async ()=>{
  try{
    // login first to get token
    const login = await fetch('http://localhost:4000/api/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email: 'tester_js@example.com', password: 'password123' }) });
    const lj = await login.json();
    const token = lj.token;
    console.log('token:', !!token);

    // post portfolio
    const pf = { fullName: 'Tester JS', headline: 'Developer', bio: 'Test bio', email: 'tester_js@example.com', website: 'https://example.com', skills: 'js,react', links: 'github.com/tester' };
    const res1 = await fetch('http://localhost:4000/api/portfolio', { method: 'POST', headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(pf) });
    console.log('POST status', res1.status, await res1.text());

    // get portfolio
    const res2 = await fetch('http://localhost:4000/api/portfolio', { headers: { Authorization: `Bearer ${token}` } });
    console.log('GET status', res2.status, await res2.text());
  }catch(e){console.error(e)}
})();
