"""
engine.py

Core scoring logic for the Flower Field Task experiment.
Handles:
- Calculates flower growth based on nutrient choices.
- Converts growth to payment (pennies).
- Optionally adds noise for certain conditions (currently not used).
"""

import random  # Reserved for future noise logic
import inspect  # Reserved for future session config access


def run_engine(nutrient_choices, flower_colors=None, scoring_system='anomaly'):
    """
    Main engine function: calculates growth for each flower based on nutrient choices.
    Args:
        nutrient_choices: List of lists, each inner list is two nutrients for a flower.
        flower_colors: (optional) List of flower colors, not used in current logic.
        scoring_system: (optional) Scoring system, default 'anomaly'.
    Returns:
        List of dicts with nutrients, growth, and noise (always None).
    """
    results = []
    n_flowers = len(nutrient_choices)
    for i, nutrients in enumerate(nutrient_choices):
        growth = calculate_growth(nutrients)
        # No intra-flower noise, only raw growth
        results.append({
            'nutrients': nutrients,
            'growth': growth,
            'noise': None  # For compatibility, always None
        })
    return results




def calculate_growth(nutrients):
    """
    Calculates growth for a single flower based on its nutrients.
    Growth rules:
      - 2x Yellow → 1.0
      - Yellow + Blue/Red → 0.8
      - 2x Blue/Red or Blue + Red → 0.6
      - Only Yellow → 0.5
      - Only Blue/Red → 0.3
      - No valid nutrients → 0.0
    """
    # Extract nutrients, handle missing values
    n1 = nutrients[0] if len(nutrients) > 0 else ''
    n2 = nutrients[1] if len(nutrients) > 1 else ''

    # Two nutrients
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
    # One nutrient
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
    # No valid nutrients
    return 0.0


def calculate_p_from_growth(growth):
    """
    Converts growth percentage to pennies for payment, format 'Xp'.
    Args:
        growth: float, growth value (0.0 to 1.0)
    Returns:
        String, e.g. '8p' for 0.8 growth
    """
    pennies = int(round(growth * 10))
    return f"{pennies}p"
