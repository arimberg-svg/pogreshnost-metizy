/* Пропорции погрешности по метизам.
   Вес: 50 г на 1 кг (5%). Штуки: 12 на 100 (12%), дробь вниз.
   Деньги: 30 ₽ на строку, с количеством не растут. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MetizCalc = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var MONEY_CAP = 30;
  var KG_LIMIT = 5;
  var PCS_LIMIT = 12;

  function roundMoney(n) {
    return Math.round(Math.abs(n) * 100) / 100;
  }

  function withinPercent(short, doc, limit) {
    return short * 100 <= doc * limit + 1e-6;
  }

  function maxWholePieces(doc) {
    if (!(doc > 0)) return 0;
    return Math.floor((doc * PCS_LIMIT + 1e-6) / 100);
  }

  function allowanceKg(doc) {
    return doc * (KG_LIMIT / 100);
  }

  function decide(input) {
    var doc = input.doc;
    var fact = input.fact;
    var sum = input.sum;
    var unit = input.unit === "pcs" ? "pcs" : "kg";
    if (doc == null || fact == null || sum == null) return { status: "empty" };
    if (!(doc > 0) || fact < 0) return { status: "bad" };

    sum = roundMoney(sum);
    var limit = unit === "kg" ? KG_LIMIT : PCS_LIMIT;
    var allowance = unit === "kg" ? allowanceKg(doc) : maxWholePieces(doc);

    if (!input.metiz) {
      return { status: "not-metiz", sum: sum, unit: unit, limit: limit, allowance: allowance };
    }
    if (fact > doc + 1e-9) {
      return {
        status: "extra",
        extra: fact - doc,
        sum: sum,
        unit: unit,
        limit: limit,
        allowance: allowance
      };
    }

    var short = doc - fact;
    if (short <= 1e-9) {
      return { status: "even", sum: sum, unit: unit, limit: limit, allowance: allowance };
    }

    var pct = (short / doc) * 100;
    var pctOk = withinPercent(short, doc, limit);
    var moneyOk = sum <= MONEY_CAP;
    return {
      status: moneyOk && pctOk ? "ok" : "stop",
      unit: unit,
      short: short,
      allowance: allowance,
      grams: doc * 50,
      shortGrams: short * 1000,
      pct: pct,
      limit: limit,
      sum: sum,
      moneyOk: moneyOk,
      pctOk: pctOk
    };
  }

  return {
    MONEY_CAP: MONEY_CAP,
    KG_LIMIT: KG_LIMIT,
    PCS_LIMIT: PCS_LIMIT,
    roundMoney: roundMoney,
    maxWholePieces: maxWholePieces,
    allowanceKg: allowanceKg,
    decide: decide
  };
});
