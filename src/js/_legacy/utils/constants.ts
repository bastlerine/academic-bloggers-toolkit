export enum MenuActionType {
    CHANGE_STYLE = 'CHANGE_STYLE',
    DESTROY_PROCESSOR = 'DESTROY_PROCESSOR',
    INSERT_STATIC_BIBLIOGRAPHY = 'INSERT_STATIC_BIBLIOGRAPHY',
    OPEN_IMPORT_DIALOG = 'OPEN_IMPORT_DIALOG',
    REFRESH_PROCESSOR = 'REFRESH_PROCESSOR',
}

interface LocaleMapper {
    [k: string]: string | undefined;
}

/**
 * This object converts the locale names in wordpress or PubMed (keys) to the locales
 * in CSL (values). If CSL doesn't have a locale for a given WordPress locale,
 * then undefined is used (which will default to en-US)
 */
export const localeMapper: LocaleMapper = {
    af: 'af-ZA',
    'af-ZA': 'af-ZA',
    afr: 'af-ZA',
    ar: 'ar',
    'ar-AR': 'ar',
    ara: 'ar',
    arq: 'ar',
    ary: 'ar',
    az: 'tr-TR',
    az_TR: 'tr-TR',
    'bg-BG': 'bg-BG',
    bg_BG: 'bg-BG',
    bul: 'bg-BG',
    ca: 'ca-AD',
    'ca-AD': 'ca-AD',
    cat: 'ca-AD',
    chi: 'zh-CN',
    'cs-CZ': 'cs-CZ',
    cs_CZ: 'cs-CZ',
    cy: 'cy-GB',
    cze: 'cs-CZ',
    'da-DK': 'da-DK',
    da_DK: 'da-DK',
    dan: 'da-DK',
    'de-AT': 'de-AT',
    'de-CH': 'de-CH',
    'de-DE': 'de-DE',
    de_CH: 'de-CH',
    de_DE: 'de-DE',
    dut: 'nl-NL',
    el: 'el-GR',
    'el-GR': 'el-GR',
    'en-GB': 'en-GB',
    'en-US': 'en-US',
    en_GB: 'en-GB',
    'es-AR': 'es-ES',
    'es-CL': 'es-CL',
    'es-ES': 'es-ES',
    'es-MX': 'es-MX',
    es_AR: 'es-ES',
    es_CL: 'es-CL',
    es_CO: 'es-CL',
    es_ES: 'es-ES',
    es_GT: 'es-ES',
    es_MX: 'es-MX',
    es_PE: 'es-CL',
    es_PR: 'es-CL',
    es_VE: 'es-CL',
    est: 'et-ET',
    et: 'et-ET',
    'et-ET': 'et-ET',
    eu: 'eu',
    'fa-IR': 'fa-IR',
    fa_AF: 'fa-IR',
    fa_IR: 'fa-IR',
    fi: 'fi-FI',
    'fi-FI': 'fi-FI',
    fin: 'fi-FI',
    'fr-CA': 'fr-CA',
    'fr-FR': 'fr-FR',
    fr_BE: 'fr-FR',
    fr_CA: 'fr-CA',
    fr_FR: 'fr-FR',
    fre: 'fr-FR',
    ger: 'de-DE',
    gre: 'el-GR',
    gsw: 'de-CH',
    'he-IL': 'he-IL',
    he_IL: 'he-IL',
    heb: 'he-IL',
    hr: 'hr-HR',
    'hr-HR': 'hr-HR',
    hrv: 'hr-HR',
    'hu-HU': 'hu-HU',
    hu_HU: 'hu-HU',
    hun: 'hu-HU',
    ice: 'is-IS',
    'id-ID': 'id-ID',
    id_ID: 'id-ID',
    ind: 'id-ID',
    'is-IS': 'is-IS',
    is_IS: 'is-IS',
    'it-IT': 'it-IT',
    it_IT: 'it-IT',
    ita: 'it-IT',
    ja: 'ja-JP',
    'ja-JP': 'ja-JP',
    jpn: 'ja-JP',
    km: 'km-KH',
    'km-KH': 'km-KH',
    'ko-KR': 'ko-KR',
    ko_KR: 'ko-KR',
    kor: 'ko-KR',
    lav: 'lv-LV',
    lb_LU: 'lt-LT',
    lit: 'lt-LT',
    'lt-LT': 'lt-LT',
    lt_LT: 'lt-LT',
    lv: 'lv-LV',
    'lv-LV': 'lv-LV',
    mn: 'mn-MN',
    'mn-MN': 'mn-MN',
    'nb-NO': 'nb-NO',
    nb_NO: 'nb-NO',
    nl: 'nl-NL',
    'nl-NL': 'nl-NL',
    nl_BE: 'nl-NL',
    nl_NL: 'nl-NL',
    'nn-NO': 'nn-NO',
    nn_NO: 'nn-NO',
    nor: 'nn-NO',
    per: 'fa-IR',
    'pl-PL': 'pl-PL',
    pl_PL: 'pl-PL',
    pol: 'pl-PL',
    por: 'pt-PT',
    'pt-BR': 'pt-BR',
    'pt-PT': 'pt-PT',
    pt_BR: 'pt-BR',
    pt_PT: 'pt-PT',
    'ro-RO': 'ro-RO',
    ro_RO: 'ro-RO',
    'ru-RU': 'ru-RU',
    ru_RU: 'ru-RU',
    rum: 'ro-RO',
    rus: 'ru-RU',
    'sk-SK': 'sk-SK',
    sk_SK: 'sk-SK',
    'sl-SI': 'sl-SI',
    sl_SI: 'sl-SI',
    slo: 'sk-SK',
    slv: 'sl-SI',
    spa: 'es-ES',
    'sr-RS': 'sr-RS',
    sr_RS: 'sr-RS',
    srp: 'sr-RS',
    'sv-SE': 'sv-SE',
    sv_SE: 'sv-SE',
    swe: 'sv-SE',
    th: 'th-TH',
    'th-TH': 'th-TH',
    tha: 'th-TH',
    'tr-TR': 'tr-TR',
    tr_TR: 'tr-TR',
    tur: 'tr-TR',
    uk: 'uk-UA',
    'uk-UA': 'uk-UA',
    ukr: 'uk-UA',
    vi: 'vi-VN',
    'vi-VN': 'vi-VN',
    vie: 'vi-VN',
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    zh_CN: 'zh-CN',
    zh_HK: 'zh-CN',
    zh_TW: 'zh-TW',
};
