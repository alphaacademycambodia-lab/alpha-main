/* Alpha Academy Cambodia — Cambodian public holidays
   ---------------------------------------------------------------------------
   READ THIS BEFORE EDITING. The dates in this file are a legal fact, not a
   convenience, and getting one wrong closes an office on the wrong day.

   HOW CAMBODIAN PUBLIC HOLIDAYS ACTUALLY WORK

   The Royal Government fixes the coming year's public holidays by sub-decree
   (អនុក្រឹត្យ), normally published several months ahead. That sub-decree is
   the authority — not this file, not any website. Two kinds of day sit on it:

     FIXED   Same Gregorian date every year: 1 January, 8 March, 9 November
             and so on. These are stable and are listed in FIXED below.

     MOVABLE Set by the Khmer lunar calendar, so the Gregorian date moves
             every year: Visak Bochea, the Royal Ploughing Ceremony, Pchum
             Ben and the Water Festival. These CANNOT be derived from the
             rules in MOVABLE below by arithmetic — the rule is written there
             so a reader knows roughly when to expect the holiday, but the
             actual date has to be copied from the sub-decree into YEARS.

   WHY THE MOVABLE DATES ARE EMPTY

   They are deliberately not guessed. A holiday calendar that prints a
   plausible but wrong date for Pchum Ben is worse than one that says "not yet
   entered", because the wrong one gets believed and put in a diary. The page
   shows every movable holiday by name with its rule, and says plainly that
   the date comes from the sub-decree, until someone fills it in here.

   HOW TO ADD A YEAR

   When the sub-decree is published, add one entry to YEARS:

       2027: {
         source: { en: 'Sub-decree No. NN ANKr.BK of DD Month YYYY',
                   km: 'អនុក្រឹត្យលេខ NN អនក្រ.បក ចុះថ្ងៃទី DD ខែ ... ឆ្នាំ ...' },
         dates: {
           visak:    '2027-05-20',      // one day
           ploughing:'2027-05-24',      // one day
           pchumben: '2027-09-29',      // FIRST of three days
           water:    '2027-11-12'       // FIRST of three days
         }
       }

   A movable holiday you leave out simply stays listed as "not yet entered".
   If a sub-decree adds a one-off holiday, or moves Khmer New Year to start on
   13 April (which happens when Maha Sangkran falls on the 13th), add it to
   that year's `extra` array and it will appear alongside the rest.

   The names below are the ones used on the sub-decrees. The English is a
   working translation, not an official one.                                  */
(function (global) {
  'use strict';

  /* -------------------------------------------------------------- fixed
     `m` is 1-12. `len` is how many days the holiday runs, starting on `d`. */
  var FIXED = [
    { key:'newyear', m:1,  d:1,  len:1,
      en:'International New Year Day',
      km:'ទិវាចូលឆ្នាំសាកល' },
    { key:'victory', m:1,  d:7,  len:1, since:1979,
      en:'Victory over Genocide Day',
      km:'ទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍' },
    { key:'women',   m:3,  d:8,  len:1,
      en:"International Women's Day",
      km:'ទិវានារីអន្តរជាតិ' },
    { key:'khmernew', m:4, d:14, len:3,
      en:'Khmer New Year',
      km:'បុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ',
      note:{ en:'Some years the sub-decree starts this on 13 April instead, when Maha Sangkran falls on that day.',
             km:'ឆ្នាំខ្លះ អនុក្រឹត្យកំណត់ឲ្យចាប់ផ្តើមពីថ្ងៃទី ១៣ មេសាវិញ ពេលមហាសង្ក្រាន្តធ្លាក់លើថ្ងៃនោះ។' } },
    { key:'labour',  m:5,  d:1,  len:1,
      en:'International Labour Day',
      km:'ទិវាពលកម្មអន្តរជាតិ' },
    { key:'kingbd',  m:5,  d:14, len:1,
      en:'Birthday of His Majesty King Norodom Sihamoni',
      km:'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះករុណា ព្រះបាទសម្តេចព្រះបរមនាថ នរោត្តម សីហមុនី' },
    { key:'queenbd', m:6,  d:18, len:1,
      en:'Birthday of Her Majesty the Queen Mother Norodom Monineath Sihanouk',
      km:'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី នរោត្តម មុនិនាថ សីហនុ' },
    { key:'constitution', m:9, d:24, len:1, since:1993,
      en:'Constitution Day',
      km:'ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ' },
    { key:'kingfather', m:10, d:15, len:1,
      en:'Commemoration Day of King Father Norodom Sihanouk',
      km:'ទិវាប្រារព្ធពិធីរំលឹកព្រះវិញ្ញាណក្ខន្ធ ព្រះករុណា ព្រះបាទសម្តេចព្រះនរោត្តម សីហនុ' },
    { key:'coronation', m:10, d:29, len:1,
      en:'Coronation Day of His Majesty King Norodom Sihamoni',
      km:'ព្រះរាជពិធីគ្រងព្រះបរមរាជសម្បត្តិ' },
    { key:'independence', m:11, d:9, len:1, since:1953,
      en:'Independence Day',
      km:'ទិវាបុណ្យឯករាជ្យជាតិ' },
    { key:'peace', m:12, d:29, len:1, from:2024,   /* first a public holiday in 2024 */
      en:'Peace Day in Cambodia',
      km:'ទិវាសន្តិភាពនៅកម្ពុជា' }
  ];

  /* ------------------------------------------------------------ movable
     The rule is for a reader's orientation only. The date must come from the
     sub-decree — see the header of this file. */
  var MOVABLE = [
    { key:'visak', len:1,
      en:'Visak Bochea Day',
      km:'ពិធីបុណ្យវិសាខបូជា',
      rule:{ en:'Full moon of the lunar month of Pisak — April or May.',
             km:'ថ្ងៃពេញបូណ៌មី ខែពិសាខ — ខែមេសា ឬឧសភា។' } },
    { key:'ploughing', len:1,
      en:'Royal Ploughing Ceremony',
      km:'ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល',
      rule:{ en:'Fourth day of the waning moon of Pisak — usually May.',
             km:'ថ្ងៃ ៤ រោច ខែពិសាខ — ជាទូទៅក្នុងខែឧសភា។' } },
    { key:'pchumben', len:3,
      en:'Pchum Ben Festival',
      km:'ពិធីបុណ្យភ្ជុំបិណ្ឌ',
      rule:{ en:'14 and 15 waning of the lunar month of Phutrobot and the day after — September or October.',
             km:'ថ្ងៃ ១៤ និង ១៥ រោច ខែភទ្របទ និងថ្ងៃបន្ទាប់ — ខែកញ្ញា ឬតុលា។' } },
    { key:'water', len:3,
      en:'Water Festival, Boat Racing and the Salutation to the Moon',
      km:'ពិធីបុណ្យអុំទូក បណ្តែតប្រទីប សំពះព្រះខែ អកអំបុក',
      rule:{ en:'Around the full moon of the lunar month of Kadeuk — usually November.',
             km:'ជុំវិញថ្ងៃពេញបូណ៌មី ខែកត្តិក — ជាទូទៅក្នុងខែវិច្ឆិកា។' } }
  ];

  /* --------------------------------------------------------------- years
     Empty on purpose. Add a year here from its sub-decree, in the shape shown
     in the header above, and its movable holidays stop showing as pending.  */
  /* Every year below was checked against the lunar reckoning in kh-lunar.js,
     and the official years matched it to the day, which is why 2027 and
     2028 can be carried provisionally on the same reckoning.

     `newYear` overrides Khmer New Year when the sub-decree does not give the
     usual 14–16 April: in 2024 (and 2028) Moha Sangkran falls late on the
     13th, so the holiday runs 13–16 April, four days. */
  var YEARS = {
    2023: {
      source: { en: 'Royal Government sub-decree on the 2023 holiday calendar',
                km: 'អនុក្រឹត្យស្តីពីប្រតិទិនឈប់សម្រាកឆ្នាំ ២០២៣' },
      dates: { visak: '2023-05-04', ploughing: '2023-05-08', pchumben: '2023-10-13', water: '2023-11-26' }
    },
    2024: {
      source: { en: 'Sub-decree No. 230 ANKr.BK of 7 July 2023 (Peace Day added by later sub-decree)',
                km: 'អនុក្រឹត្យលេខ ២៣០ អនក្រ.បក ចុះថ្ងៃទី ៧ ខែកក្កដា ឆ្នាំ ២០២៣ (ទិវាសន្តិភាពបន្ថែមដោយអនុក្រឹត្យក្រោយ)' },
      newYear: { d: 13, len: 4 },
      dates: { visak: '2024-05-22', ploughing: '2024-05-26', pchumben: '2024-10-01', water: '2024-11-14' }
    },
    2025: {
      source: { en: 'Sub-decree No. 204 ANKr.BK of 29 August 2024',
                km: 'អនុក្រឹត្យលេខ ២០៤ អនក្រ.បក ចុះថ្ងៃទី ២៩ ខែសីហា ឆ្នាំ ២០២៤' },
      dates: { visak: '2025-05-11', ploughing: '2025-05-15', pchumben: '2025-09-21', water: '2025-11-04' }
    },
    2026: {
      source: { en: 'Sub-decree No. 167 ANKr.BK of 18 September 2025',
                km: 'អនុក្រឹត្យលេខ ១៦៧ អនក្រ.បក ចុះថ្ងៃទី ១៨ ខែកញ្ញា ឆ្នាំ ២០២៥' },
      dates: {
        visak:     '2026-05-01',   /* same day as Labour Day this year */
        ploughing: '2026-05-05',
        pchumben:  '2026-10-10',
        water:     '2026-11-23'
      }
    },
    /* 2027's sub-decree had not been published when this was entered, so the
       four dates below are the lunar reckoning (the same dates the
       khmer-lunar-calendar.com app shows), flagged `provisional`. The page
       says so beside them. Replace `source` and drop `provisional` once the
       sub-decree is out — and correct any date it moves. */
    2027: {
      provisional: true,
      source: { en: 'Khmer lunar calendar — provisional until the 2027 sub-decree is published',
                km: 'ប្រតិទិនចន្ទគតិខ្មែរ — បណ្តោះអាសន្ន រហូតដល់អនុក្រឹត្យឆ្នាំ ២០២៧ ត្រូវបានចេញផ្សាយ' },
      dates: {
        visak:     '2027-05-20',
        ploughing: '2027-05-24',
        pchumben:  '2027-09-29',
        water:     '2027-11-12'
      }
    },
    2028: {
      provisional: true,
      source: { en: 'Khmer lunar calendar — provisional until the 2028 sub-decree is published',
                km: 'ប្រតិទិនចន្ទគតិខ្មែរ — បណ្តោះអាសន្ន រហូតដល់អនុក្រឹត្យឆ្នាំ ២០២៨ ត្រូវបានចេញផ្សាយ' },
      newYear: { d: 13, len: 4 },   /* Moha Sangkran 13 April 2028, 11:12 PM */
      dates: { visak: '2028-05-08', ploughing: '2028-05-12', pchumben: '2028-09-17', water: '2028-10-31' }
    }
  };

  global.KH_HOLIDAYS = {
    fixed: FIXED,
    movable: MOVABLE,
    years: YEARS,

    /* Everything the page needs for one year, in one call.
       Returns { days: {...}, list: [...], pending: [...], source: {en,km}|null }
       where `days` is keyed 'YYYY-MM-DD' so a calendar cell is one lookup. */
    forYear: function (year) {
      var days = {}, list = [], pending = [];
      var y = YEARS[year] || null;

      function pad(n) { return (n < 10 ? '0' : '') + n; }
      function stamp(yy, mm, dd) { return yy + '-' + pad(mm) + '-' + pad(dd); }

      /* Spread a holiday over its `len` days, letting it run into the next
         month where it has to — the Water Festival can straddle a month end. */
      function place(entry, startY, startM, startD) {
        var dt = new Date(startY, startM - 1, startD);
        var first = stamp(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
        for (var i = 0; i < entry.len; i++) {
          var k = stamp(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
          var here = { key: entry.key, en: entry.en, km: entry.km, part: i + 1, of: entry.len };
          /* Two holidays can share a day (1 May 2026 is Labour Day and Visak
             Bochea). The day stays one day off; its label carries both. */
          if (days[k]) {
            var was = days[k];
            here = { key: was.key, part: was.part, of: was.of,
                     en: was.en + ' · ' + entry.en, km: was.km + ' · ' + entry.km };
          }
          days[k] = here;
          dt.setDate(dt.getDate() + 1);
        }
        list.push({
          key: entry.key, en: entry.en, km: entry.km, len: entry.len,
          start: first, note: entry.note || null, movable: !!entry.movable,
          nth: entry.since ? year - entry.since : 0
        });
      }

      FIXED.forEach(function (f) {
        if (f.from && year < f.from) { return; }
        if (f.key === 'khmernew' && y && y.newYear) {
          var ny = {}; for (var k in f) { ny[k] = f[k]; }
          ny.len = y.newYear.len;
          return place(ny, year, 4, y.newYear.d);
        }
        place(f, year, f.m, f.d);
      });

      MOVABLE.forEach(function (mv) {
        var iso = y && y.dates && y.dates[mv.key];
        if (!iso) { pending.push(mv); return; }
        var bits = String(iso).split('-');
        place({ key: mv.key, len: mv.len, en: mv.en, km: mv.km, movable: true },
              +bits[0], +bits[1], +bits[2]);
      });

      (y && y.extra ? y.extra : []).forEach(function (x) {
        var bits = String(x.date).split('-');
        place({ key: x.key || 'extra', len: x.len || 1, en: x.en, km: x.km, note: x.note || null },
              +bits[0], +bits[1], +bits[2]);
      });

      list.sort(function (a, b) { return a.start < b.start ? -1 : a.start > b.start ? 1 : 0; });

      return { days: days, list: list, pending: pending, source: (y && y.source) || null,
               provisional: !!(y && y.provisional) };
    }
  };
})(window);
