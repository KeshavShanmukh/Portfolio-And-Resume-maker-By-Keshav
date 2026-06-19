(async ()=>{
  const base = 'http://localhost:4000'
  const ts = Date.now()
  const email = `apitest+${ts}@example.com`
  console.log('Using email', email)

  const regRes = await fetch(`${base}/api/auth/register`, {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username:'apitest', email, password:'password' })
  })
  const reg = await regRes.json()
  console.log('register', reg)
  if(!reg.token){ console.error('Register failed'); process.exit(1) }
  const token = reg.token

  const createPf = await fetch(`${base}/api/portfolio/create`, {
    method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ title:'API Portfolio' })
  })
  const pf = await createPf.json()
  console.log('create portfolio', pf)
  const pid = pf.id

  const sec1 = await fetch(`${base}/api/portfolio/section`, { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ portfolioId: pid, type:'hero', content: { name:'API User' } }) })
  const s1 = await sec1.json(); console.log('create section1', s1)
  const sid1 = s1.id

  const upd = await fetch(`${base}/api/portfolio/section/${sid1}`, { method:'PUT', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ content:{ name:'API User', role:'Engineer', tagline:'Hello from API'} }) })
  console.log('update section1', await upd.json())

  const sec2 = await fetch(`${base}/api/portfolio/section`, { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ portfolioId: pid, type:'about', content:{ description:'About via API' } }) })
  const s2 = await sec2.json(); console.log('create section2', s2)
  const sid2 = s2.id

  // reorder: set section2 position 1, section1 position 2
  await fetch(`${base}/api/portfolio/section/${sid2}`, { method:'PUT', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ position:1 }) })
  await fetch(`${base}/api/portfolio/section/${sid1}`, { method:'PUT', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ position:2 }) })
  console.log('reordered sections')

  const portfolioAfter = await (await fetch(`${base}/api/portfolio/${pid}`, { headers:{'Authorization':`Bearer ${token}`} })).json()
  console.log('portfolio after reorder', portfolioAfter)

  // delete section2
  const delSec = await (await fetch(`${base}/api/portfolio/section/${sid2}`, { method:'DELETE', headers:{'Authorization':`Bearer ${token}`}})).json()
  console.log('deleted section2', delSec)

  // delete portfolio
  const delPf = await (await fetch(`${base}/api/portfolio/${pid}`, { method:'DELETE', headers:{'Authorization':`Bearer ${token}`}})).json()
  console.log('deleted portfolio', delPf)

  console.log('API smoke test completed')
  process.exit(0)
})().catch(e=>{console.error(e); process.exit(1)})
