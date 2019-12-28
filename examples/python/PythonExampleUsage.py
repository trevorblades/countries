import requests, json

FETCH_COUNT = 50
URL = "https://countries.trevorblades.com"

query = """
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
"""


def get_country_data(arguments='{}'):
    arguments = dict(query=arguments)  # wrap query in dictionary

    graph_ql_request = requests.post(URL,
                                     data=json.dumps(arguments),
                                     headers={"Content-type": "application/json"})

    country_data = graph_ql_request.json()
    return country_data


print(get_country_data(arguments=query))
