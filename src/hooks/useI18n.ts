import React, { useContext } from 'react';
import { AIConfigContext } from '../context';
import { locales, i18nKeys } from '../i18n/locales';

export const useI18n = () => {
  const config = useContext(AIConfigContext);
  const locale = config.locale || 'zh-CN';
  const strings = locales[locale] || locales['zh-CN'];

  const t = (key: i18nKeys) => {
    return strings[key] || key;
  };

  return { t, locale };
};
