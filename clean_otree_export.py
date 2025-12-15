import csv

# Fichier d'entrée et de sortie
INPUT_FILE = 'otree_exported_data.csv'
OUTPUT_FILE = 'clean_file.csv'

# Colonnes à extraire et leur nouvel ordre/nom (correspondent aux nouveaux champs Player)
COLUMNS = [
    ('participant.code', 'code_participant'),
    ('player.treatment', 'traitement'),
    ('player.phase', 'phase'),
    ('subsession.round_number', 'round'),
    ('player.flower_colors', 'couleur_fleurs'),
    ('player.nutrient_choice', 'nutrients'),
    ('player.score_per_flower', 'score_fleurs'),
    ('player.noise_applied', 'noise'),
    ('player.cumulative_earnings', 'score_total_fin_exp'),
    ('player.year_of_birth', 'annee_naissance'),
    ('player.feedback', 'feedback'),
]

def clean_otree_export(input_path=INPUT_FILE, output_path=OUTPUT_FILE):
    with open(input_path, newline='', encoding='utf-8') as infile:
        reader = csv.DictReader(infile, delimiter=';')
        rows = list(reader)

    # Adapter la taille des colonnes à leur contenu
    output_rows = []
    for row in rows:
        output_row = {}
        for old, new in COLUMNS:
            output_row[new] = row.get(old, '')
        output_rows.append(output_row)

    # Calculer la largeur max de chaque colonne
    col_widths = {col[1]: len(col[1]) for col in COLUMNS}
    for row in output_rows:
        for col in col_widths:
            col_widths[col] = max(col_widths[col], len(str(row[col]) if row[col] is not None else ''))

    # Écriture du fichier clean
    with open(output_path, 'w', newline='', encoding='utf-8') as outfile:
        writer = csv.writer(outfile)
        # En-tête
        writer.writerow([col[1] for col in COLUMNS])
        # Lignes de données
        for row in output_rows:
            writer.writerow([row[col[1]] for col in COLUMNS])

if __name__ == '__main__':
    clean_otree_export()
