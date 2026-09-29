/* Alpha Academy Cambodia — the other days on a Khmer calendar
   ---------------------------------------------------------------------------
   Everything a printed Khmer calendar carries besides the days off, laid out
   to match what khmer-lunar-calendar.com shows. None of these closes an
   office — the public holidays are kh-holidays.js, and only that file.

   FOUR KINDS OF DAY, AND WHERE EACH ONE COMES FROM

     obs    International and national days (Literacy Day, Mine Awareness
            Day, the UNESCO listings…). Same Gregorian date every year; listed
            in FIXED. `since` makes "33rd anniversary" possible.

     cul    Cultural days that follow a lunar calendar: Meak Bochea is worked
            out from the Khmer lunar date (15 waxing of Meak, via kh-lunar.js);
            Chinese New Year, the Kitchen God and Mid-Autumn come from CN, a
            table generated from the Chinese lunisolar calendar. When CN runs
            out those days stop appearing rather than being guessed.

     ben    Kan Ben — Ben 1 on 1 waning of Phutrobot, one a day up to the day
            before Pchum Ben itself (the last day of the month).

     sila   Buddhist holy days (ថ្ងៃសីល): 8 and 15 waxing, 8 waning, and the
            last day of every lunar month. ថ្ងៃកោរ (head-shaving day) is the
            day before the full moon and the day before the last day.

   The last two are computed from kh-lunar.js, which was checked against the
   site for February and September 2026 before this shipped.                */
(function (global) {
  'use strict';

  var FIXED = [
    { m:2,  d:14, en:"Valentine's Day", km:'ថ្ងៃបុណ្យនៃសេចក្តីស្រលាញ់' },
    { start:2003, m:2,  d:21, en:'National Day on Maternal, Newborn and Child Health', km:'ទិវាជាតិសុខភាពមាតា និងទារក' },
    { start:2000, m:2,  d:24, en:'National Mine Awareness Day', km:'ទិវាជាតិយល់ដឹងពីមីន' },
    { start:1993, m:3,  d:22, en:'World Water Day', km:'ទិវាទឹកពិភពលោក' },
    { m:4,  d:7,  en:'World Health Day', km:'ទិវាសុខភាពពិភពលោក' },
    { start:1994, m:5,  d:3,  en:'World Press Freedom Day', km:'ទិវាសេរីភាពសារព័ត៌មានពិភពលោក' },
    { m:5,  d:8,  en:'World Red Cross and Red Crescent Day', km:'ទិវាពិភពលោកកាកបាទក្រហម អឌ្ឍចន្ទក្រហម' },
    { start:1994, m:5,  d:15, en:'International Day of Families', km:'ទិវាអន្តរជាតិនៃគ្រួសារ' },
    { start:1970, m:4,  d:22, en:'Earth Day', km:'ទិវាផែនដី' },
    { pub:'remembrance', start:1984, m:5,  d:20, en:'National Day of Remembrance', km:'ទិវាជាតិនៃការចងចាំ' },
    { start:1988, m:5,  d:31, en:'World No Tobacco Day', km:'ទិវាពិភពលោកគ្មានថ្នាំជក់' },
    { pub:'children', m:6,  d:1,  en:"International Children's Day", km:'ទិវាកុមារអន្តរជាតិ' },
    { m:6,  d:5,  en:'World Environment Day', km:'ទិវាបរិស្ថានពិភពលោក' },
    { m:7,  d:7,  since:2008, en:'Preah Vihear Temple inscribed on the UNESCO World Heritage List', km:'ប្រាសាទព្រះវិហារ ត្រូវបានចុះក្នុងបញ្ជីបេតិកភណ្ឌពិភពលោករបស់អង្គការយូណេស្កូ' },
    { m:7,  d:8,  since:2017, en:'Sambor Prei Kuk inscribed on the UNESCO World Heritage List', km:'តំបន់ប្រាសាទសំបូរព្រៃគុក ត្រូវបានចុះក្នុងបញ្ជីបេតិកភណ្ឌពិភពលោករបស់អង្គការយូណេស្កូ' },
    { start:1990, m:7,  d:11, en:'World Population Day', km:'ទិវាប្រជាជនពិភពលោក' },
    { start:2000, m:8,  d:12, en:'International Youth Day', km:'ទិវាយុវជនអន្តរជាតិ' },
    { m:9,  d:8,  en:'International Literacy Day', km:'ទិវាអក្ខរកម្មអន្តរជាតិ' },
    { start:1995, m:9,  d:16, en:'International Day for the Preservation of the Ozone Layer', km:'ទិវាអន្តរជាតិការពារស្រទាប់អូហ្សូន' },
    { m:9,  d:17, since:2023, en:'Koh Ker inscribed on the UNESCO World Heritage List', km:'តំបន់ប្រាសាទកោះកេរ ត្រូវបានចុះក្នុងបញ្ជីបេតិកភណ្ឌពិភពលោករបស់អង្គការយូណេស្កូ' },
    { start:1982, m:9,  d:21, en:'International Day of Peace', km:'ទិវាសន្តិភាពអន្តរជាតិ' },
    { start:1980, m:9,  d:27, en:'World Tourism Day', km:'ទិវាទេសចរណ៍ពិភពលោក' },
    { start:1994, m:10, d:5,  en:"World Teachers' Day", km:'ទិវាគ្រូបង្រៀនពិភពលោក' },
    { start:1981, m:10, d:16, en:'World Food Day', km:'ទិវាចំណីអាហារពិភពលោក' },
    { pub:'paris', m:10, d:23, since:1991, en:'Paris Peace Agreements Day', km:'ទិវារំលឹកកិច្ចព្រមព្រៀងសន្តិភាពទីក្រុងប៉ារីស' },
    { start:1988, m:12, d:1,  en:'World AIDS Day', km:'ទិវាអេដស៍ពិភពលោក' },
    { start:1992, m:12, d:3,  en:'International Day of Persons with Disabilities', km:'ទិវាជនពិការអន្តរជាតិ' },
    { start:2004, m:12, d:9,  en:'International Anti-Corruption Day', km:'ទិវាប្រយុទ្ធប្រឆាំងអំពើពុករលួយ' },
    { pub:'humanrights', m:12, d:10, en:'Human Rights Day', km:'ទិវាសិទ្ធិមនុស្សអន្តរជាតិ' },
    { m:12, d:14, since:1992, en:'Angkor inscribed on the UNESCO World Heritage List', km:'តំបន់អង្គរ ត្រូវបានចុះក្នុងបញ្ជីបេតិកភណ្ឌពិភពលោករបស់អង្គការយូណេស្កូ' },
    { m:12, d:25, en:'Christmas Day', km:'បុណ្យណូអែល' }
  ];

  /* Chinese lunisolar dates, generated (not hand-typed): New Year's Day, the
     Kitchen God (24th of the 12th month, as Cambodia's Chinese community
     keeps it) and Mid-Autumn (15th of the 8th month). */
  var CN = {
    1975: { cny:'1975-02-11', kitchen:'1975-02-04', moon:'1975-09-20' },
    1976: { cny:'1976-01-31', kitchen:'1976-01-24', moon:'1976-09-08' },
    1977: { cny:'1977-02-18', kitchen:'1977-02-11', moon:'1977-09-27' },
    1978: { cny:'1978-02-07', kitchen:'1978-02-01', moon:'1978-09-16' },
    1979: { cny:'1979-01-28', kitchen:'1979-01-22', moon:'1979-10-05' },
    1980: { cny:'1980-02-16', kitchen:'1980-02-10', moon:'1980-09-23' },
    1981: { cny:'1981-02-05', kitchen:'1981-01-29', moon:'1981-09-12' },
    1982: { cny:'1982-01-25', kitchen:'1982-01-18', moon:'1982-10-01' },
    1983: { cny:'1983-02-13', kitchen:'1983-02-06', moon:'1983-09-21' },
    1984: { cny:'1984-02-02', kitchen:'1984-01-26', moon:'1984-09-10' },
    1985: { cny:'1985-02-20', kitchen:'1985-02-13', moon:'1985-09-29' },
    1986: { cny:'1986-02-09', kitchen:'1986-02-02', moon:'1986-09-18' },
    1987: { cny:'1987-01-29', kitchen:'1987-01-23', moon:'1987-10-07' },
    1988: { cny:'1988-02-17', kitchen:'1988-02-11', moon:'1988-09-25' },
    1989: { cny:'1989-02-06', kitchen:'1989-01-31', moon:'1989-09-14' },
    1990: { cny:'1990-01-27', kitchen:'1990-01-20', moon:'1990-10-03' },
    1991: { cny:'1991-02-15', kitchen:'1991-02-08', moon:'1991-09-22' },
    1992: { cny:'1992-02-04', kitchen:'1992-01-28', moon:'1992-09-11' },
    1993: { cny:'1993-01-23', kitchen:'1993-01-16', moon:'1993-09-30' },
    1994: { cny:'1994-02-10', kitchen:'1994-02-04', moon:'1994-09-20' },
    1995: { cny:'1995-01-31', kitchen:'1995-01-24', moon:'1995-09-09' },
    1996: { cny:'1996-02-19', kitchen:'1996-02-12', moon:'1996-09-27' },
    1997: { cny:'1997-02-07', kitchen:'1997-02-01', moon:'1997-09-16' },
    1998: { cny:'1998-01-28', kitchen:'1998-01-22', moon:'1998-10-05' },
    1999: { cny:'1999-02-16', kitchen:'1999-02-09', moon:'1999-09-24' },
    2000: { cny:'2000-02-05', kitchen:'2000-01-30', moon:'2000-09-12' },
    2001: { cny:'2001-01-24', kitchen:'2001-01-18', moon:'2001-10-01' },
    2002: { cny:'2002-02-12', kitchen:'2002-02-05', moon:'2002-09-21' },
    2003: { cny:'2003-02-01', kitchen:'2003-01-26', moon:'2003-09-11' },
    2004: { cny:'2004-01-22', kitchen:'2004-01-15', moon:'2004-09-28' },
    2005: { cny:'2005-02-09', kitchen:'2005-02-02', moon:'2005-09-18' },
    2006: { cny:'2006-01-29', kitchen:'2006-01-23', moon:'2006-10-06' },
    2007: { cny:'2007-02-18', kitchen:'2007-02-11', moon:'2007-09-25' },
    2008: { cny:'2008-02-07', kitchen:'2008-01-31', moon:'2008-09-14' },
    2009: { cny:'2009-01-26', kitchen:'2009-01-19', moon:'2009-10-03' },
    2010: { cny:'2010-02-14', kitchen:'2010-02-07', moon:'2010-09-22' },
    2011: { cny:'2011-02-03', kitchen:'2011-01-27', moon:'2011-09-12' },
    2012: { cny:'2012-01-23', kitchen:'2012-01-17', moon:'2012-09-30' },
    2013: { cny:'2013-02-10', kitchen:'2013-02-04', moon:'2013-09-19' },
    2014: { cny:'2014-01-31', kitchen:'2014-01-24', moon:'2014-09-08' },
    2015: { cny:'2015-02-19', kitchen:'2015-02-12', moon:'2015-09-27' },
    2016: { cny:'2016-02-08', kitchen:'2016-02-02', moon:'2016-09-15' },
    2017: { cny:'2017-01-28', kitchen:'2017-01-21', moon:'2017-10-04' },
    2018: { cny:'2018-02-16', kitchen:'2018-02-09', moon:'2018-09-24' },
    2019: { cny:'2019-02-05', kitchen:'2019-01-29', moon:'2019-09-13' },
    2020: { cny:'2020-01-25', kitchen:'2020-01-18', moon:'2020-10-01' },
    2021: { cny:'2021-02-12', kitchen:'2021-02-05', moon:'2021-09-21' },
    2022: { cny:'2022-02-01', kitchen:'2022-01-26', moon:'2022-09-10' },
    2023: { cny:'2023-01-22', kitchen:'2023-01-15', moon:'2023-09-29' },
    2024: { cny:'2024-02-10', kitchen:'2024-02-03', moon:'2024-09-17' },
    2025: { cny:'2025-01-29', kitchen:'2025-01-23', moon:'2025-10-06' },
    2026: { cny:'2026-02-17', kitchen:'2026-02-11', moon:'2026-09-25' },
    2027: { cny:'2027-02-06', kitchen:'2027-01-31', moon:'2027-09-15' },
    2028: { cny:'2028-01-26', kitchen:'2028-01-20', moon:'2028-10-03' },
    2029: { cny:'2029-02-13', kitchen:'2029-02-07', moon:'2029-09-22' },
    2030: { cny:'2030-02-03', kitchen:'2030-01-27', moon:'2030-09-12' },
    2031: { cny:'2031-01-23', kitchen:'2031-01-17', moon:'2031-10-01' },
    2032: { cny:'2032-02-11', kitchen:'2032-02-05', moon:'2032-09-19' },
    2033: { cny:'2033-01-31', kitchen:'2033-01-24', moon:'2033-09-08' },
    2034: { cny:'2034-02-19', kitchen:'2034-02-12', moon:'2034-09-27' },
    2035: { cny:'2035-02-08', kitchen:'2035-02-01', moon:'2035-09-16' }
  };

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function stamp(y, m, d) { return y + '-' + pad(m) + '-' + pad(d); }
  function shift(iso, n) {
    var b = iso.split('-'), dt = new Date(+b[0], +b[1] - 1, +b[2] + n);
    return stamp(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
  }
  var KHD = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
  function kn(n) { return String(n).replace(/[0-9]/g, function (d) { return KHD[+d]; }); }
  function ord(n) {
    var s = ['th','st','nd','rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  var cache = {};

  global.KH_OBSERVANCES = {
    fixed: FIXED,
    cn: CN,

    /* { days: { 'YYYY-MM-DD': { ev:[{kind,en,km}], sila:bool, kor:bool } },
         list: [{ start, kind, en, km }] }  — list is obs/cul/ben only. */
    forYear: function (year) {
      if (cache[year]) { return cache[year]; }
      var days = {}, list = [];
      function at(k) { return days[k] || (days[k] = { ev: [], sila: false, kor: false }); }
      function add(k, kind, en, km, pub) {
        at(k).ev.push({ kind: kind, en: en, km: km, pub: pub || null });
        list.push({ start: k, kind: kind, en: en, km: km, pub: pub || null });
      }

      FIXED.forEach(function (f) {
        if (f.since && year < f.since) { return; }   /* Koh Ker is not a 1990 event */
        if (f.start && year < f.start) { return; }   /* not yet observed that year */
        var en = f.en, km = f.km;
        if (f.since && year > f.since) {
          en += ' (' + ord(year - f.since) + ' anniversary)';
          km += ' ខួបលើកទី' + kn(year - f.since);
        }
        add(stamp(year, f.m, f.d), 'obs', en, km, f.pub);
      });

      var cn = CN[year];
      if (cn) {
        add(cn.kitchen, 'cul', 'Kitchen God Festival', 'ថ្ងៃសែនដកជើងធូប');
        add(shift(cn.cny, -1), 'cul', "Chinese New Year's Eve", 'ថ្ងៃសែនចូលឆ្នាំចិន');
        for (var i = 0; i < 3; i++) { add(shift(cn.cny, i), 'cul', 'Chinese New Year', 'ចូលឆ្នាំចិន'); }
        add(cn.moon, 'cul', 'Mid-Autumn Festival', 'សែនព្រះខែ');
      }

      /* Walk the year once through the Khmer lunar calendar. */
      var LUN = global.KhLunar;
      if (LUN) {
        for (var dt = new Date(year, 0, 1); dt.getFullYear() === year; dt.setDate(dt.getDate() + 1)) {
          var y = dt.getFullYear(), m = dt.getMonth() + 1, d = dt.getDate(), r;
          try { r = LUN.of(y, m, d); } catch (e) { continue; }
          var k = stamp(y, m, d), last = r.day === r.monthLength;

          if (r.day === 8 || r.day === 15 || r.day === 23 || last) { at(k).sila = true; }
          if (r.day === 14 || r.day === r.monthLength - 1) { at(k).kor = true; }

          if (r.month === 'មាឃ' && r.day === 15) { add(k, 'cul', 'Meak Bochea', 'ពិធីបុណ្យមាឃបូជា'); }
          if (r.month === 'ភទ្របទ' && r.day > 15 && !last) {
            var n = r.day - 15;
            add(k, 'ben', 'Ben ' + n, 'បិណ្ឌ ' + kn(n));
          }
        }
      }

      list.sort(function (a, b) { return a.start < b.start ? -1 : a.start > b.start ? 1 : 0; });
      return (cache[year] = { days: days, list: list });
    }
  };
})(window);
