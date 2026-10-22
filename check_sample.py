"""Check independently known fixture results; no model, server, or API required."""
import math

from run_sample import sample_results


def check(condition, message):
    if not condition:
        raise AssertionError(message)


def main():
    result = sample_results()
    solar = result['solar']
    statistics = {item['operation']: item for item in solar['statistics']}
    expected = {'min': 1000, 'max': 1600, 'mean': 1300, 'sum': 5200, 'trend': 600}
    for operation, value in expected.items():
        check(statistics[operation]['value'] == value, f'Incorrect {operation}')
        check(statistics[operation]['missing'] == 1, 'Missing value not reported')
        check(statistics[operation]['observations'] == 4, 'Incorrect observation count')
    energy = solar['energy']
    check(math.isclose(energy['value'], 1100 / 3_600_000, rel_tol=1e-12),
          'Incorrect W-second to kWh integration')
    check(energy['unit'] == 'kWh', 'Incorrect energy unit')
    check(energy['covered_seconds'] == 1, 'Incorrect time coverage')
    check(energy['excluded_intervals'] == 3, 'Missing intervals or long gap included')
    check(energy['partial'] is True, 'Partial coverage not disclosed')
    check(result['business']['average_revenue']['value'] == 1143, 'Incorrect revenue mean')
    check(result['business']['units'][0]['missing'] == 1, 'Missing business data not reported')
    print('PASS: known statistics, missing data, energy units, accepted coverage, and general data.')


if __name__ == '__main__':
    main()
