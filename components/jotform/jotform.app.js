const axios = require('axios')
const querystring = require('querystring')
 
function ensureTrailingSlash(str) {
  if (str.endsWith('/')) return str
  return `${str}/`
}


module.exports = { 
  type: "app", 
  app: "jotform", 
  propDefinitions: {  
    formId: {
      // after should be array + assume after apps
      type: "string", 
      label: "Form", 
      // options needs to support standardized opts for pagination
      async options(opts) { 
        const forms = await this.getForms(this.$auth.api_key)  
        // XXX short hand where value and label are same value
        return forms.content.map(form => { 
          return { label: form.title, value: form.id } 
        }) 
      },
      // XXX validate  
    }, 
  }, 
  methods: {
    async _makeRequest(config) {
      if (config.params) { 
        const query = querystring.stringify(config.params)
        delete config.params
        const sep = config.url.indexOf('?') === -1 ? '?' : '&'
        config.url += `${sep}${query}`
        config.url = config.url.replace('?&','?')
      }
      return await axios(config)
    },
    async getForms() {   
      return (await this._makeRequest({
        url: `https://api.jotform.com/user/forms`,
        method: `GET`,
        headers: {
          "APIKEY": this.$auth.api_key,
        },
      })).data
    }, 
    async getWebhooks(opts = {}) {
      const { formId } = opts
      return (await this._makeRequest({
        url: `https://api.jotform.com/form/${encodeURIComponent(formId)}/webhooks`,
        method: `GET`,
        headers: {
          "APIKEY": this.$auth.api_key,
        },
      })).data
    },
    async createHook(opts = {}) {
      const { formId, endpoint } = opts
      return (await this._makeRequest({ 
        url: `https://api.jotform.com/form/${formId}/webhooks`,
        method: `POST`, 
        headers: {
          "APIKEY": this.$auth.api_key,
        },
        params: {
          webhookURL: ensureTrailingSlash(endpoint),
        },
      }))
    },
    async deleteHook(opts = {}) { 
      const { formId, endpoint } = opts
      const webhooks = (await this.getWebhooks({ formId })).content
      const webhookIdx = webhooks.findIndex(w => w === ensureTrailingSlash(endpoint))
      if(webhookIdx !== -1) {
        console.log(`Did not detect ${endpoint} as a webhook registered for form ID ${formId}.`)
        return
      }
      console.log(`Deleting webhook at index ${webhookIdx}...`)
      return (await this._makeRequest({ 
        url: `https://api.jotform.com/form/${formId}/webhooks/${webhookIdx}`,
        method: `DELETE`, 
        headers: {
          "APIKEY": this.$auth.api_key,
        },
      }))
    },
  },
}