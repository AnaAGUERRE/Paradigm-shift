# Script to generate Prolific bonus payment file from oTree export
# Output: bonus_payments.csv with columns: Prolific PID, Bonus Amount

import csv

# Input and output file names
INPUT_FILE = 'otree_exported_data.csv'  # oTree export
OUTPUT_FILE = 'bonus_payments.csv'      # File for Prolific bonus upload

# These are the relevant columns in your oTree export
PID_COL = 'participant.label'           # Prolific PID (from participant_label)
BONUS_COL = 'player.cumulative_earnings'  # Bonus amount (total earnings)

# Read the oTree export and write the bonus file
with open(INPUT_FILE, newline='', encoding='utf-8') as infile, open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as outfile:
    reader = csv.DictReader(infile, delimiter=';')
    writer = csv.writer(outfile)
    writer.writerow(['Prolific PID', 'Bonus Amount'])
    seen = set()
    for row in reader:
        pid = row.get(PID_COL, '').strip()
        bonus = row.get(BONUS_COL, '').strip()
        # Only one bonus per participant (take the last non-empty value)
        if pid and pid not in seen and bonus:
            writer.writerow([pid, bonus])
            seen.add(pid)

print(f"Bonus file created: {OUTPUT_FILE}")
