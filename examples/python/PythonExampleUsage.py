import requests

url = "https://countries.trevorblades.com"

json = {'query': '''
{
  country(code: "BR") {
    name
    native
    emoji
    currency
    languages {
      code
      name
    }
  }
}
'''}

r = requests.post(url, json=json)
print(r.json())
