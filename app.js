(function () {
  const AIRPORTS = [
    { id: 'SBCB', label: 'SBCB', runways: [{ id: 'RWY_10_28', label: '10/28', departures: ['10', '28'] }] },
    { id: 'SBFS', label: 'SBFS', runways: [{ id: 'RWY_15_33', label: '15/33', departures: ['15', '33'] }] },
    { id: 'SBGL', label: 'SBGL', runways: [{ id: 'RWY_10_28', label: '10/28', departures: ['10', '28'] }, { id: 'RWY_15_33', label: '15/33', departures: ['15', '33'] }] },
    { id: 'SBJR', label: 'SBJR', runways: [{ id: 'RWY_03_21', label: '03/21', departures: ['03', '21'] }] },
    { id: 'SBME', label: 'SBME', runways: [{ id: 'RWY_05_23', label: '05/23', departures: ['05', '23'] }, { id: 'RWY_06_24', label: '06/24', departures: ['06', '24'] }] },
    { id: 'SBMI', label: 'SBMI', runways: [{ id: 'RWY_09_27', label: '09/27', departures: ['09', '27'] }] },
    { id: 'SBNF', label: 'SBNF', runways: [{ id: 'RWY_08_26', label: '08/26', departures: ['08', '26'] }] },
    { id: 'SBRJ', label: 'SBRJ', runways: [{ id: 'RWY_02L_20R', label: '02L/20R', departures: ['02L', '20R'] }, { id: 'RWY_02R_20L', label: '02R/20L', departures: ['02R', '20L'] }] },
    { id: 'SBVT', label: 'SBVT', runways: [{ id: 'RWY_06_24', label: '06/24', departures: ['06', '24'] }, { id: 'RWY_02_20', label: '02/20', departures: ['02', '20'] }] }
  ];

  const state = {
    catA: {
      base: 'SBFS', runway: 'RWY_15_33', dep: '15', configuration: 'standard',
      pa: '0', oat: '25', weight: '6700', wind: '5', nonce: 0
    },
    rtoResult: null,
    adcResult: null
  };

  function getBaseUrl() {
    const href = window.location.href.split('#')[0];
    return href.endsWith('/') ? href : href + '/';
  }

  function buildUrl(path, params) {
    const url = new URL(path.replace(/^\/+/, ''), getBaseUrl());
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    });
    return url.toString();
  }

  function routePath() {
    const raw = (window.location.hash || '#/').replace(/^#/, '');
    return raw.startsWith('/') ? raw : '/' + raw;
  }

  function navLink(path, label) {
    const active = routePath() === path ? 'active' : '';
    return `<a class="${active}" href="#${path}">${label}</a>`;
  }

  function card(path, title, subtitle) {
    return `<a class="card-link" href="#${path}"><strong>${title}</strong><span>${subtitle}</span></a>`;
  }

  function appShell(content) {
    return `
      <header class="topbar">
        <div>
          <a class="brand" href="#/">AW139 Performance Companion</a>
          <div class="subbrand">Shell estático simples + módulos embarcados</div>
        </div>
        <nav class="nav">
          ${navLink('/', 'Home')}
          ${navLink('/calculators/wat', 'WAT')}
          ${navLink('/calculators/rto', 'RTO / CTO')}
          ${navLink('/calculators/adc', 'ADC')}
          ${navLink('/workflows/cat-a-clear-area', 'Cat A')}
        </nav>
      </header>
      <main class="main">${content}</main>
    `;
  }

  function moduleShell(title, subtitle, src) {
    return `
      <div class="page">
        <section class="hero compact"><div><h1>${title}</h1><p>${subtitle}</p></div></section>
        <section class="module-shell">
          <div class="module-shell__header"><strong>${title}</strong><a href="${src}" target="_blank" rel="noreferrer">Abrir módulo</a></div>
          <iframe class="module-frame" src="${src}" title="${title}"></iframe>
        </section>
      </div>
    `;
  }

  function homePage() {
    return `
      <div class="page">
        <section class="hero">
          <div>
            <h1>AW139 Performance Companion</h1>
            <p>Integração base do shell com WAT, RTO/CTO e ADC, agora em versão estática simples para GitHub Pages.</p>
          </div>
          <div class="hero-note">build estática plain</div>
        </section>
        <section class="panel">
          <h2>Módulos</h2>
          <p class="muted-paragraph">Esta versão remove a dependência da build React do shell. A navegação do companion agora é feita por hash e JavaScript simples, com os módulos maduros embarcados em iframes.</p>
        </section>
        <section class="card-grid">
          ${card('/calculators/wat', 'WAT', 'Módulo legado WAT embarcado no companion.')}
          ${card('/calculators/rto', 'RTO / CTO', 'Módulo legado RTO/CTO embarcado.')}
          ${card('/calculators/adc', 'ADC', 'ADC v60 embarcado como módulo interno.')}
          ${card('/workflows/cat-a-clear-area', 'Cat A Clear Area', 'Primeiro fluxo integrado RTO → ADC.')}
        </section>
      </div>
    `;
  }

  function getAirport(id) {
    return AIRPORTS.find(a => a.id === id) || AIRPORTS[0];
  }
  function getRunway(baseId, runwayId) {
    const airport = getAirport(baseId);
    return airport.runways.find(r => r.id === runwayId) || airport.runways[0];
  }

  function catAPage() {
    const airport = getAirport(state.catA.base);
    const runway = getRunway(state.catA.base, state.catA.runway);
    const rtoSrc = buildUrl('modules/rto/index.html', {
      configuration: state.catA.configuration,
      pa: state.catA.pa,
      oat: state.catA.oat,
      weight: state.catA.weight,
      wind: state.catA.wind,
      autorun: 1
    });
    const adcSrc = buildUrl('modules/adc/index.html', {
      base: state.catA.base,
      runway: state.catA.runway,
      dep: state.catA.dep,
      rto: state.rtoResult && state.rtoResult.distanceM != null ? state.rtoResult.distanceM : undefined,
      autorun: 1,
      nonce: state.catA.nonce
    });

    const rtoSummary = state.rtoResult
      ? `<div class="result-card__value">${Math.round(state.rtoResult.distanceM)} m</div>
         <div class="result-card__summary">Base ${state.rtoResult.baseDistanceM != null ? Math.round(state.rtoResult.baseDistanceM) : '—'} m · correção ${state.rtoResult.correctionM != null ? Math.round(state.rtoResult.correctionM) : '—'} m.</div>`
      : `<div class="result-card__summary">Aguardando cálculo do módulo RTO.</div>`;

    const adcSummary = state.adcResult
      ? `<div class="result-card__value">${Math.round(state.adcResult.fullAvailableAsda)} m</div>
         <div class="result-card__summary">ASDA disponível na cabeceira ${state.adcResult.dep}. Veredito: <span class="${state.adcResult.go ? 'status-go' : 'status-nogo'}">${state.adcResult.go ? 'GO' : 'NO GO'}</span>.</div>`
      : `<div class="result-card__summary">Aguardando análise do módulo ADC.</div>`;

    return `
      <div class="page">
        <section class="hero compact"><div><h1>Cat A Clear Area</h1><p>Primeira ponte funcional entre o RTO e o ADC dentro do companion.</p></div></section>
        <div class="integration-grid">
          <aside class="form-panel">
            <label>Base
              <select id="baseSelect">${AIRPORTS.map(a => `<option value="${a.id}" ${a.id === state.catA.base ? 'selected' : ''}>${a.label}</option>`).join('')}</select>
            </label>
            <label>Runway
              <select id="runwaySelect">${airport.runways.map(r => `<option value="${r.id}" ${r.id === state.catA.runway ? 'selected' : ''}>${r.label}</option>`).join('')}</select>
            </label>
            <label>Cabeceira de saída
              <select id="depSelect">${runway.departures.map(d => `<option value="${d}" ${d === state.catA.dep ? 'selected' : ''}>${d}</option>`).join('')}</select>
            </label>
            <label>Configuração RTO
              <select id="configSelect">
                <option value="standard" ${state.catA.configuration === 'standard' ? 'selected' : ''}>Standard</option>
                <option value="eapsOff" ${state.catA.configuration === 'eapsOff' ? 'selected' : ''}>EAPS OFF</option>
                <option value="eapsOn" ${state.catA.configuration === 'eapsOn' ? 'selected' : ''}>EAPS ON</option>
                <option value="ibfInstalled" ${state.catA.configuration === 'ibfInstalled' ? 'selected' : ''}>IBF Installed</option>
              </select>
            </label>
            <label>PA (ft)<input id="paInput" type="number" value="${state.catA.pa}"></label>
            <label>OAT (°C)<input id="oatInput" type="number" value="${state.catA.oat}"></label>
            <label>Peso (kg)<input id="weightInput" type="number" value="${state.catA.weight}"></label>
            <label>Headwind (kt)<input id="windInput" type="number" value="${state.catA.wind}"></label>
            <button id="reloadAdcBtn" class="primary-button">Recarregar ADC com a RTO atual</button>
            <div class="footnote">O RTO autoroda com os parâmetros acima. Quando o módulo devolver a distância, o shell reenviará a RTO ao ADC.</div>
          </aside>
          <section class="results-stack">
            <div class="summary-grid">
              <article class="result-card"><h3>Resumo RTO</h3>${rtoSummary}</article>
              <article class="result-card"><h3>Resumo ADC</h3>${adcSummary}</article>
            </div>
            <section class="module-shell">
              <div class="module-shell__header"><strong>RTO / CTO</strong><a href="${rtoSrc}" target="_blank" rel="noreferrer">Abrir módulo</a></div>
              <iframe class="module-frame" src="${rtoSrc}" title="RTO / CTO"></iframe>
            </section>
            <section class="module-shell">
              <div class="module-shell__header"><strong>ADC</strong><a href="${adcSrc}" target="_blank" rel="noreferrer">Abrir módulo</a></div>
              <iframe class="module-frame" src="${adcSrc}" title="ADC"></iframe>
            </section>
          </section>
        </div>
      </div>
    `;
  }

  function render() {
    const path = routePath();
    let content = '';
    if (path === '/calculators/wat') {
      content = moduleShell('WAT', 'Módulo legado WAT embarcado no companion.', buildUrl('modules/wat/index.html'));
    } else if (path === '/calculators/rto') {
      content = moduleShell('RTO / CTO', 'Módulo legado RTO/CTO embarcado no companion.', buildUrl('modules/rto/index.html'));
    } else if (path === '/calculators/adc') {
      content = moduleShell('ADC', 'ADC v60 embarcado no companion.', buildUrl('modules/adc/index.html'));
    } else if (path === '/workflows/cat-a-clear-area') {
      content = catAPage();
    } else {
      content = homePage();
    }
    document.getElementById('app').innerHTML = appShell(content);
    bindEvents();
  }

  function bindEvents() {
    const baseSelect = document.getElementById('baseSelect');
    const runwaySelect = document.getElementById('runwaySelect');
    const depSelect = document.getElementById('depSelect');
    const configSelect = document.getElementById('configSelect');
    const paInput = document.getElementById('paInput');
    const oatInput = document.getElementById('oatInput');
    const weightInput = document.getElementById('weightInput');
    const windInput = document.getElementById('windInput');
    const reloadAdcBtn = document.getElementById('reloadAdcBtn');
    if (!baseSelect) return;

    baseSelect.addEventListener('change', () => {
      const airport = getAirport(baseSelect.value);
      const rw = airport.runways[0];
      state.catA.base = airport.id;
      state.catA.runway = rw.id;
      state.catA.dep = rw.departures[0];
      render();
    });
    runwaySelect.addEventListener('change', () => {
      const rw = getRunway(state.catA.base, runwaySelect.value);
      state.catA.runway = rw.id;
      if (!rw.departures.includes(state.catA.dep)) state.catA.dep = rw.departures[0];
      render();
    });
    depSelect.addEventListener('change', () => { state.catA.dep = depSelect.value; render(); });
    configSelect.addEventListener('change', () => { state.catA.configuration = configSelect.value; render(); });
    paInput.addEventListener('input', () => { state.catA.pa = paInput.value; render(); });
    oatInput.addEventListener('input', () => { state.catA.oat = oatInput.value; render(); });
    weightInput.addEventListener('input', () => { state.catA.weight = weightInput.value; render(); });
    windInput.addEventListener('input', () => { state.catA.wind = windInput.value; render(); });
    reloadAdcBtn.addEventListener('click', () => { state.catA.nonce += 1; render(); });
  }

  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (data.type === 'aw139pc:rtoResult' && data.payload) {
      state.rtoResult = data.payload;
      if (routePath() === '/workflows/cat-a-clear-area') render();
      return;
    }
    if (data.type === 'aw139pc:adcResult' && data.payload) {
      state.adcResult = data.payload;
      if (routePath() === '/workflows/cat-a-clear-area') render();
    }
  });

  window.addEventListener('hashchange', render);
  render();
})();
