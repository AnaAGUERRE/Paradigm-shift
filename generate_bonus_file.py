# Script to generate Prolific bonus payment file from oTree export
# Output: bonus_payments.csv with columns: Prolific PID, Bonus Amount

import csv


# Input file name
INPUT_FILE = 'otree_exported_data.csv'  # oTree export

# These are the relevant columns in your oTree export
PID_COL = 'participant.label'           # Prolific PID (from participant_label)
BONUS_COL = 'player.cumulative_earnings'  # Bonus amount (total earnings)

# Read the oTree export and write a bonus file per treatment
from collections import defaultdict

treatment_col = 'player.treatment'  # Change if your treatment column has a different name
bonus_data = defaultdict(list)

with open(INPUT_FILE, newline='', encoding='utf-8') as infile:
    reader = csv.DictReader(infile, delimiter=';')
    seen = set()
    for row in reader:
        pid = row.get(PID_COL, '').strip()
        bonus = row.get(BONUS_COL, '').strip()
        phase = row.get('player.phase', '').strip()
        treatment = row.get(treatment_col, '').strip()
        # Condition: 'Anomaly CT' uses 'Test 2', others use 'Results'
        if not (pid and bonus and treatment):
            continue
        valid_phase = phase == 'Results'
        if pid not in seen and valid_phase:
            bonus_data[treatment].append((pid, bonus))
            seen.add(pid)

# Write a separate file for each treatment
for treatment, rows in bonus_data.items():
    output_file = f'bonus_payments_{treatment}.csv'
    with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
        writer = csv.writer(outfile)
        writer.writerow(['Prolific PID', 'Bonus Amount'])
        writer.writerows(rows)
    print(f"Bonus file created: {output_file}")
