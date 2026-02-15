# This file contains the core scoring logic for the Flower Field Task. 
# It calculates the "growth" of each flower based on the nutrients chosen, 
# and optionally adds noise for certain experimental conditions.

import random # Used to add random noise 
import inspect  # Used to access the calling frame's session config

def run_engine(nutrient_choices, flower_colors=None, scoring_system='anomaly'):

    # Nutrient choices is a list of flowers, each flower has 2 nutrients, e.g.:
    # [["red", "blue"], ["yellow", "yellow"], ["blue", "blue"]]

    results = []
    n_flowers = len(nutrient_choices)
    for i, nutrients in enumerate(nutrient_choices):
        growth = calculate_growth(nutrients)
        # Plus de bruit intra-fleur, uniquement la croissance brute
        results.append({
            'nutrients': nutrients,
            'growth': growth,
            'noise': None  # Pour compatibilité, mais toujours None
        })
    return results



def calculate_growth(nutrients):

    # NOUVELLES RÈGLES :
    # - 2x Yellow → 100% (1.0)
    # - Yellow + Blue (either order) → 0.8
    # - Yellow + Red (either order) → 0.8
    # - 2x Blue → 60% (0.6)
    # - Blue + Red (either order) → 0.6
    # - 2x Red → 0.6
    # - Only Yellow → 0.5
    # - Only Blue → 0.3
    # - Only Red → 0.3

    # Extract nutrients, handle missing values
    n1 = nutrients[0] if len(nutrients) > 0 else ''
    n2 = nutrients[1] if len(nutrients) > 1 else ''

    # Cas : Deux nutriments
    if n1 and n2:
        if n1 == 'Yellow' and n2 == 'Yellow':
            return 1.0
        if (n1 == 'Yellow' and n2 == 'Blue') or (n1 == 'Blue' and n2 == 'Yellow'):
            return 0.8
        if (n1 == 'Yellow' and n2 == 'Red') or (n1 == 'Red' and n2 == 'Yellow'):
            return 0.8
        if n1 == 'Blue' and n2 == 'Blue':
            return 0.6
        if (n1 == 'Blue' and n2 == 'Red') or (n1 == 'Red' and n2 == 'Blue'):
            return 0.6
        if n1 == 'Red' and n2 == 'Red':
            return 0.6
    # Cas : Un seul nutriment
    if n1 and not n2:
        if n1 == 'Yellow':
            return 0.5
        if n1 == 'Blue':
            return 0.3
        if n1 == 'Red':
            return 0.3
    if n2 and not n1:
        if n2 == 'Yellow':
            return 0.5
        if n2 == 'Blue':
            return 0.3
        if n2 == 'Red':
            return 0.3
    # Cas : Aucun nutriment valide
    return 0.0

# Converts growth percentage to pennies for payment, format 'Xp'.
def calculate_p_from_growth(growth):
    pennies = int(round(growth * 10))
    return f"{pennies}p"
