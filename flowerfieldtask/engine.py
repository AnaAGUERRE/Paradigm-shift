# flowerfieldtask/engine.py

def run_engine(nutrient_choices):
    """
    Nutrient choices est une liste de fleurs, chaque fleur a 2 nutriments, ex:
    [["red", "blue"], ["yellow", "yellow"], ["blue", "blue"]]
    """
    results = []
    for nutrients in nutrient_choices:
        growth = calculate_growth(nutrients)
        results.append({
            'nutrients': nutrients,
            'growth': growth
        })
    return results


def calculate_growth(nutrients):
    """
    Scoring Rules:
    - 2x Blue → 100% (1.0)
    - Blue + Yellow (either order) → 80% (0.8)
    - Blue + Red (either order) → 75% (0.75)
    - 2x Yellow → 60% (0.6)
    - Yellow + Red (either order) → 55% (0.55)
    - 2x Red → 50% (0.5)
    - Only Blue (if same one counted twice) → 50% (0.5)
    - Only Yellow (if same one counted twice) → 30% (0.3)
    - Only Red (if same one counted twice) → 25% (0.25)
    """
    n1 = nutrients[0] if len(nutrients) > 0 else ''
    n2 = nutrients[1] if len(nutrients) > 1 else ''

    # Deux nutriments
    if n1 and n2:
        if n1 == 'Blue' and n2 == 'Blue':
            return 1.0
        if (n1 == 'Blue' and n2 == 'Yellow') or (n1 == 'Yellow' and n2 == 'Blue'):
            return 0.8
        if (n1 == 'Blue' and n2 == 'Red') or (n1 == 'Red' and n2 == 'Blue'):
            return 0.75
        if n1 == 'Yellow' and n2 == 'Yellow':
            return 0.6
        if (n1 == 'Yellow' and n2 == 'Red') or (n1 == 'Red' and n2 == 'Yellow'):
            return 0.55
        if n1 == 'Red' and n2 == 'Red':
            return 0.5
    # Un seul nutriment
    if n1 and not n2:
        if n1 == 'Blue':
            return 0.5
        if n1 == 'Yellow':
            return 0.3
        if n1 == 'Red':
            return 0.25
    if n2 and not n1:
        if n2 == 'Blue':
            return 0.5
        if n2 == 'Yellow':
            return 0.3
        if n2 == 'Red':
            return 0.25
    return 0.0


def calculate_points_from_growth(growth):
    """
    Convertit la croissance en points pour le paiement.
    """
    return round(growth, 2)
