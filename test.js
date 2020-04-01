let chai = require('chai');
let chaiHttp = require('chai-http');
const expect=chai.expect;
const assert = chai.assert;

chai.use(chaiHttp);

function get(host, path) {
  return chai.request('http://127.0.0.1:9000')
    .get(path)
    .redirects(0)
    .set('host', host)
}

function httpsGet(host, path) {
  return get(host, path)
    .set('X-Forwarded-Proto','https')
}

function parse(json) {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.log(json + ' did not parse to JSON', error)
  }
}

function verifyHost(host, res) {
  let content = parse(res.text);
  expect(content.host).to.be.equal(host);
}

function verifyForwardedHost(host, res) {
  let content = parse(res.text);
  expect(content['x-forwarded-host']).to.be.equal(host);
}

function testProxying(host, path, proxyTo, secure) {
  it(host + path + ' should be proxied to container at ' + proxyTo, function(done) {
    const verify = (err,res) => {
      expect(err).to.be.null;
      verifyHost(proxyTo, res);
      // verifyForwardedHost(host, res);
      done();
    };
    let fn = secure?httpsGet:get;

    fn(host, path).end(verify);
  });
}

function testCaching(host, path, secure) {
  it(host + path + ' should be proxied and cached', function(done) {
    const verifyCacheMiss = (res) => {
      expect(res.headers['x-proxy-cache']).to.be.equal('MISS');
    }

    const verifyCacheHit = (res) => {
      expect(res.headers['x-proxy-cache']).to.be.equal('HIT');
    }

    let fn = secure?httpsGet:get;

    fn(host, path)
      .then(verifyCacheMiss)
      .then(()=>{
        return fn(host, path).then(verifyCacheHit);
      })
      .then(done)
      .catch((e)=>{done(e)})
  });
}

function testRedirect(host, path, expectedUrl, secure=false) {
  let fn = secure?httpsGet:get;
  it('request to ' + host + path + ' should redirect to ' + expectedUrl, function(done) {
    fn(host,path).end((err,res)=>{
      expect(res).to.redirect;
      expect(res).to.redirectTo(expectedUrl);
      done();
    });
  });
}

function testResponseHeader(host, path, header, headerValue) {
  it('http request to ' + host + path + ' should have response header: ' + header + ' should have value: ' + headerValue, function(done) {
    get(host,path).end((err,res)=>{
      expect(res.headers[header]).to.be.equal(headerValue);
      done();
    });
  });
}

describe('api.opentransport.ro', function() {

  it('https should not redirect', function(done) {
    httpsGet('api.opentransport.ro','/geocoding/v1/').end((err,res)=>{
      expect(err).to.be.null;
      done();
    });
  });

  it('/ should contain static content', function(done) {
    get('api.opentransport.ro','/').end((err,res)=>{
      expect(err).to.be.null;
      expect(res.statusCode).to.be.equal(200);
      expect(res.text).to.contain('Digitransit APIs');
      done();
    });
  });

  testProxying('api.opentransport.ro','/geocoding/v1/','pelias-api:8080');
  //testCaching('api.opentransport.ro','/geocoding/v1/foo', true);
  testProxying('api.opentransport.ro','/graphiql/hsl','graphiql:8080');
  testProxying('api.opentransport.ro','/realtime/trip-updates/v1/FOLI','siri2gtfsrt:8080');
  //testCaching('api.opentransport.ro','/realtime/trip-updates/v1/foo', false)
  testProxying('api.opentransport.ro','/realtime/vehicle-positions/v1/','navigator-server:8080');
 // testCaching('api.opentransport.ro','/realtime/vehicle-positions/v1/foo',false);
  testProxying('api.opentransport.ro','/realtime/raildigitraffic2gtfsrt/v1/','raildigitraffic2gtfsrt:8080');
 //testCaching('api.opentransport.ro','/realtime/raildigitraffic2gtfsrt/v1/foo',true);
  testProxying('api.opentransport.ro','/map/v1/','hsl-map-server:8080');
  testProxying('api.opentransport.ro','/routing/v1/routers/finland','opentripplanner-finland:8080');
  testProxying('api.opentransport.ro','/routing/v1/routers/hsl','opentripplanner-hsl:8080');
  testProxying('api.opentransport.ro','/routing/v1/routers/waltti','opentripplanner-waltti:8080');
  testProxying('dev-api.opentransport.ro','/routing/v1/routers/next-finland','opentripplanner-finland:8080');
  testProxying('dev-api.opentransport.ro','/routing/v1/routers/next-hsl','opentripplanner-hsl:8080');
  testProxying('dev-api.opentransport.ro','/routing/v1/routers/next-waltti','opentripplanner-waltti:8080');
  testProxying('api.opentransport.ro','/routing-data/v2/hsl/router-hsl.zip','opentripplanner-data-con-hsl:8080');
  testResponseHeader('api.opentransport.ro','/routing-data/v2/hsl/router-config.json', 'access-control-allow-origin', '*');
  testProxying('api.opentransport.ro','/routing-data/v2/waltti/router-waltti.zip','opentripplanner-data-con-waltti:8080');
  testResponseHeader('api.opentransport.ro','/routing-data/v2/waltti/router-config.json', 'access-control-allow-origin', '*');
  testProxying('api.opentransport.ro','/routing-data/v2/finland/router-finland.zip','opentripplanner-data-con-finland:8080');
  testResponseHeader('api.opentransport.ro','/routing-data/v2/finland/router-config.json', 'access-control-allow-origin', '*');
  testProxying('dev-api.opentransport.ro','/routing-data/v2/next-hsl/router-hsl.zip','opentripplanner-data-con-hsl:8080');
  testResponseHeader('dev-api.opentransport.ro','/routing-data/v2/next-hsl/router-config.json', 'access-control-allow-origin', '*');
  testProxying('dev-api.opentransport.ro','/routing-data/v2/next-waltti/router-waltti.zip','opentripplanner-data-con-waltti:8080');
  testResponseHeader('dev-api.opentransport.ro','/routing-data/v2/next-waltti/router-config.json', 'access-control-allow-origin', '*');
  testProxying('dev-api.opentransport.ro','/routing-data/v2/next-finland/router-finland.zip','opentripplanner-data-con-finland:8080');
  testResponseHeader('dev-api.opentransport.ro','/routing-data/v2/next-finland/router-config.json', 'access-control-allow-origin', '*');
  testProxying('api.opentransport.ro','/ui/v1/finland/sw.js','digitransit-ui-default:8080');
  testProxying('api.opentransport.ro','/ui/v1/waltti/sw.js','digitransit-ui-waltti:8080');
  testProxying('api.opentransport.ro','/ui/v1/hsl/sw.js','digitransit-ui-hsl:8080');
  testProxying('api.opentransport.ro','/ui/v1/hsl-next/sw.js','digitransit-ui-hsl-next:8080');
  testProxying('api.opentransport.ro','/timetables/v1/hsl/stops/1010105.pdf','hsl-timetable-container:8080');
});

describe('hsl ui', function() {
  testRedirect('www.beta.reittiopas.fi','/kissa','http://beta.reittiopas.fi/kissa');

  testRedirect('reittiopas.fi','/kissa','https://reittiopas.hsl.fi/kissa');
  testRedirect('beta.reittiopas.fi','/kissa','https://reittiopas.hsl.fi/kissa', true);
  testRedirect('www.reittiopas.fi','/kissa','https://reittiopas.hsl.fi/kissa', true);
  testRedirect('m.reittiopas.fi','/kissa','https://reittiopas.hsl.fi/kissa');
  testRedirect('dev.reittiopas.fi','/kissa','https://dev.reittiopas.fi/kissa');

  it('https should not redirect', function(done) {
    httpsGet('beta.opentransport.ro','/kissa').end((err,res)=>{
      expect(err).to.be.null;
      done();
    });
  });

  testProxying('dev.reittiopas.fi','/','digitransit-ui-hsl:8080', true);

  testProxying('reittiopas.hsl.fi','/','digitransit-ui-hsl:8080', true);

  testCaching('reittiopas.hsl.fi','/sw.js', true);

  testRedirect('reittiopas.hsl.fi','/uudetvyohykkeet','https://reittiopas.hsl.fi', true);
  testRedirect('reittiopas.hsl.fi','/uudetvyöhykkeet','https://reittiopas.hsl.fi', true);

  //next-dev site
  testRedirect('www.next-dev.opentransport.ro','/kissa','http://next-dev.opentransport.ro/kissa');
  testRedirect('next-dev.opentransport.ro','/kissa','https://next-dev.opentransport.ro/kissa');
  testProxying('next-dev.opentransport.ro','/','digitransit-ui-hsl-next:8080', true);
  testCaching('next-dev.opentransport.ro','/sw.js', true);

  testRedirect('vyohykereittiopas.hsl.fi','/kissa','https://reittiopas.hsl.fi/kissa');
});

describe('matka ui', function() {
  testRedirect('www.opas.matka.fi','/kissa','http://opas.matka.fi/kissa');
  testRedirect('opas.matka.fi','/kissa','https://opas.matka.fi/kissa');

  testProxying('opas.matka.fi','/','digitransit-ui-default:8080', true);

  testCaching('opas.matka.fi','/sw.js', true);

  it('https should not redirect', function(done) {
    httpsGet('opas.matka.fi','/kissa').end((err,res)=>{
      expect(err).to.be.null;
      done();
    });
  });
});

describe('waltti ui', function() {
  const cities = ['hameenlinna', 'jyvaskyla', 'joensuu', 'kotka', 'kuopio', 'lahti',
                  'lappeenranta', 'mikkeli', 'oulu', 'turku', 'tampere', 'kouvola', 'rovaniemi', 'salo'];

  cities.forEach(function(city) {
    testRedirect('dev-'+city+'.opentransport.ro','/kissa','https://dev-'+city+'.opentransport.ro/kissa');
    testProxying('dev-'+city+'.opentransport.ro','/','digitransit-ui-waltti:8080', true);
    testRedirect(city+'.opentransport.ro','/kissa','https://'+city+'.opentransport.ro/kissa');
    testProxying(city+'.opentransport.ro','/','digitransit-ui-waltti:8080', true);
  });

  testRedirect('reittiopas.foli.fi','/kissa','https://reittiopas.foli.fi/kissa');
  testProxying('reittiopas.foli.fi','/','digitransit-ui-waltti:8080', true);

  testRedirect('reittiopas.hameenlinna.fi','/kissa','https://reittiopas.hameenlinna.fi/kissa');
  testProxying('reittiopas.hameenlinna.fi','/','digitransit-ui-waltti:8080', true);

  testRedirect('pilottirepa.tampere.fi','/kissa','https://pilottirepa.tampere.fi/kissa');
  testProxying('pilottirepa.tampere.fi','/','digitransit-ui-waltti:8080', true);

  testRedirect('repa.tampere.fi','/kissa','https://repa.tampere.fi/kissa');
  testProxying('repa.tampere.fi','/','digitransit-ui-waltti:8080', true);

  testRedirect('reittiopas.tampere.fi','/kissa','https://reittiopas.tampere.fi/kissa');
  testProxying('reittiopas.tampere.fi','/','digitransit-ui-waltti:8080', true);
  testCaching('reittiopas.tampere.fi','/sw.js', true);

  testRedirect('reittiopas.salo.fi','/kissa','https://reittiopas.salo.fi/kissa');
  testProxying('reittiopas.salo.fi','/','digitransit-ui-waltti:8080', true);

  it('https should not redirect', function(done) {
    httpsGet('turku.opentransport.ro','/kissa').end((err,res)=>{
      expect(err).to.be.null;
      done();
    });
  });
});

describe('sentry-analytics', function() {
  testProxying('sentry-analytics.opentransport.ro','/','digitransit-sentry-analytics:8080', true);
  testRedirect('sentry-analytics.opentransport.ro','/kissa','https://sentry-analytics.opentransport.ro/kissa');
});

describe('yleisviestipalvelu', function() {
  testCaching('yleisviesti.hsl.fi','/', true);
  testProxying('yleisviesti.hsl.fi','/','yleisviestipalvelu:8080', true);
  testRedirect('yleisviesti.hsl.fi','/kissa','https://yleisviesti.hsl.fi/kissa');
  testCaching('dev-yleisviesti.opentransport.ro','/', true);
  testProxying('dev-yleisviesti.opentransport.ro','/','yleisviestipalvelu:8080', true);
  testRedirect('dev-yleisviesti.opentransport.ro','/kissa','https://dev-yleisviesti.opentransport.ro/kissa');
});

describe('digitransit', function() {
  testProxying('opentransport.ro','/','digitransit-site:8080', true);
});

describe('ext-proxy', function() {
  this.timeout(5000);
  testCaching('api.opentransport.ro','/out/helsinki-fi.smoove.pro/api-public/stations',false);
  testCaching('api.opentransport.ro','/out/data.foli.fi/citybike/smoove',false);
  testCaching('api.opentransport.ro','/out/p.hsl.fi/api/v1/facilities.json?limit=-1',false);
  testCaching('api.opentransport.ro','/out/92.62.36.215/RTIX/trip-updates',false);
  testCaching('api.opentransport.ro','/out/tyokalu.navici.com/joukkoliikenne/manual-gtfsrt/api/gtfsrt/alerts',false);
});
