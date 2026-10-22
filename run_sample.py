"""Run selected XogTamar calculations on synthetic fixtures, entirely locally."""
import json
from pathlib import Path

from samples.analytics import calculate, column_info, ingest

ROOT = Path(__file__).resolve().parent


def sample_results():
    solar = ingest((ROOT / 'data' / 'solar-intervals.csv').read_bytes(), '.csv')
    business = ingest((ROOT / 'data' / 'general.csv').read_bytes(), '.csv')
    power = 'Solar power (W)'
    return {
        'data_kind': 'synthetic demonstration fixtures; not real measurements',
        'solar': {
            'columns': column_info(solar, [power]),
            'statistics': [calculate(solar, power, operation)
                           for operation in ('min', 'max', 'mean', 'sum', 'trend')],
            'energy': calculate(solar, power, 'energy', timestamp='Timestamp',
                                unit='W', max_gap_seconds=2),
        },
        'business': {
            'average_revenue': calculate(business, 'Revenue', 'mean'),
            'units': column_info(business, ['Units']),
        },
    }


if __name__ == '__main__':
    print(json.dumps(sample_results(), indent=2, allow_nan=False))
