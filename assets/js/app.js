'use strict';

const TRANSLATIONS = {
  it: {
    appName:            'Date Utils',
    tabAddDays:         'Aggiungi giorni',
    tabCountDays:       'Conta giorni',
    descAddDays:        'Calcola la nuova data aggiungendo o sottraendo giorni a una data',
    descCountDays:      'Calcola il numero di giorni, mesi e anni tra due date',
    labelDate:          'Data',
    labelStartDate:     'Data inizio',
    labelEndDate:       'Data fine',
    labelDays:          'Numero di giorni',
    radioAdd:           'Aggiungi',
    radioSubtract:      'Sottrai',
    btnCalculate:       'Calcola',
    btnClear:           'Cancella',
    resultDate:         'Data risultante',
    resultYears:        'Anni',
    resultMonths:       'Mesi',
    resultDays:         'Giorni',
    errEnterDate:       'Inserisci una data',
    errEnterDays:       'Inserisci il numero di giorni',
    errEnterStartDate:  'Inserisci la data di inizio',
    errEnterEndDate:    'Inserisci la data di fine',
    madeWith:           'Sviluppata con',
  },
  en: {
    appName:            'Date Utils',
    tabAddDays:         'Add Days',
    tabCountDays:       'Count Days',
    descAddDays:        'Calculate a new date by adding or subtracting days from a given date',
    descCountDays:      'Calculate the number of days, months and years between two dates',
    labelDate:          'Date',
    labelStartDate:     'Start date',
    labelEndDate:       'End date',
    labelDays:          'Number of days',
    radioAdd:           'Add',
    radioSubtract:      'Subtract',
    btnCalculate:       'Calculate',
    btnClear:           'Clear',
    resultDate:         'Resulting date',
    resultYears:        'Years',
    resultMonths:       'Months',
    resultDays:         'Days',
    errEnterDate:       'Please enter a date',
    errEnterDays:       'Please enter the number of days',
    errEnterStartDate:  'Please enter the start date',
    errEnterEndDate:    'Please enter the end date',
    madeWith:           'Built with',
  },
};

const DateService = {

  /**
   * Add or subtract days from a date string (YYYY-MM-DD)
   * @param {string} dateStr  - input date in YYYY-MM-DD format
   * @param {number} days     - number of days to add (negative to subtract)
   * @returns {string} resulting date in YYYY-MM-DD format
   */
  addDays(dateStr, days) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return this.toInputFormat(date);
  },

  /**
   * Calculate full years between two dates
   * @param {string} startStr - start date in YYYY-MM-DD format
   * @param {string} endStr   - end date in YYYY-MM-DD format
   * @returns {number} number of complete years
   */
  getYearsBetween(startStr, endStr) {
    const start = new Date(startStr);
    const end   = new Date(endStr);
    let years = end.getFullYear() - start.getFullYear();
    const monthDiff = end.getMonth() - start.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < start.getDate())) {
      years--;
    }
    return Math.abs(years);
  },

  /**
   * Calculate full months between two dates
   * @param {string} startStr - start date in YYYY-MM-DD format
   * @param {string} endStr   - end date in YYYY-MM-DD format
   * @returns {number} number of complete months
   */
  getMonthsBetween(startStr, endStr) {
    const start = new Date(startStr);
    const end   = new Date(endStr);
    let months = (end.getFullYear() - start.getFullYear()) * 12
               + (end.getMonth() - start.getMonth());
    if (end.getDate() < start.getDate()) months--;
    return Math.abs(months);
  },

  /**
   * Calculate total days between two dates
   * @param {string} startStr - start date in YYYY-MM-DD format
   * @param {string} endStr   - end date in YYYY-MM-DD format
   * @returns {number} number of days (always positive)
   */
  getDaysBetween(startStr, endStr) {
    const start = new Date(startStr);
    const end   = new Date(endStr);
    const ms    = Math.abs(end - start);
    return Math.round(ms / (1000 * 60 * 60 * 24));
  },

  /**
   * Format a Date object to YYYY-MM-DD (native input[type=date] format)
   * @param {Date} date
   * @returns {string}
   */
  toInputFormat(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  /**
   * Format a YYYY-MM-DD string to a locale-friendly display format
   * @param {string} dateStr
   * @param {string} lang - 'it' or 'en'
   * @returns {string}
   */
  toDisplayFormat(dateStr, lang) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  },

  /** @returns {string} today in YYYY-MM-DD format */
  today() {
    return this.toInputFormat(new Date());
  },
};

function dateApp() {
  return {
    lang: navigator.language.startsWith('it') ? 'it' : 'en',
    get t() { return TRANSLATIONS[this.lang]; },
    toggleLang() { this.lang = this.lang === 'it' ? 'en' : 'it'; },

    /**
     * Active tab: 'addDays' | 'countDays' 
     */
    tab: 'addDays',
    switchTab(tab) {
      this.tab = tab;
      this.clearAll();
    },

    /**
     * Add Days tab state
     */  
    addDate:     '',
    addDays:     '',
    addMode:     'add',       // 'add' | 'subtract'
    addResult:   null,
    addError:    '',

    /**
     * Count Days tab state
     */
    startDate:   '',
    endDate:     '',
    countResult: null,
    countError:  '',

    /**
     * Clear current tab
     */
    clearAll() {
      this.addDate   = ''; this.addDays  = '';
      this.addResult = null; this.addError = '';
      this.startDate = ''; this.endDate  = '';
      this.countResult = null; this.countError = '';
    },

    /**
     * Calculate resulting date
     */
    calculateDate() {
      this.addError  = '';
      this.addResult = null;

      if (!this.addDate) { this.addError = this.t.errEnterDate; return; }
      if (!this.addDays || this.addDays < 1) { this.addError = this.t.errEnterDays; return; }

      const days   = this.addMode === 'add'
                   ? parseInt(this.addDays)
                   : -parseInt(this.addDays);
      const result = DateService.addDays(this.addDate, days);
      this.addResult = DateService.toDisplayFormat(result, this.lang);
    },

    /**
     * Calculate difference between two dates
     */  
    calculateDuration() {
      this.countError  = '';
      this.countResult = null;

      if (!this.startDate) { this.countError = this.t.errEnterStartDate; return; }
      if (!this.endDate)   { this.countError = this.t.errEnterEndDate;   return; }

      this.countResult = {
        years:  DateService.getYearsBetween(this.startDate, this.endDate),
        months: DateService.getMonthsBetween(this.startDate, this.endDate),
        days:   DateService.getDaysBetween(this.startDate, this.endDate),
      };
    },

  };
}
