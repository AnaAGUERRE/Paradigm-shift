# flowerfieldtask/engine.py

def run_engine(nutrient_choices):
    """
    Nutrient choices is a list of flowers, each flower has 2 nutrients, e.g.:
    [["red", "blue"], ["yellow", "yellow"], ["blue", "blue"]]
    """
    results = []  # List to store results for each flower
    for nutrients in nutrient_choices:
        # Calculate growth for the current flower
        growth = calculate_growth(nutrients)
        # Append nutrients and growth to results
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
    # Extract nutrients, handle missing values
    n1 = nutrients[0] if len(nutrients) > 0 else ''
    n2 = nutrients[1] if len(nutrients) > 1 else ''

    # Deux nutriments
    # Case: Two nutrients
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
    # Case: Only one nutrient
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
    # Case: No valid nutrients
    return 0.0


def calculate_points_from_growth(growth):
    """
    Converts growth percentage to points for payment.
    """
    return round(growth, 2)  # Round to 2 decimal places
