import { config } from '@vue/test-utils'
import i18n from '@/i18n'

// Every mounted component gets the i18n plugin, with English as the default language.
config.global.plugins = [i18n]
