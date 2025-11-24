# flowerfieldtask/engine.py

def run_engine(nutrient_choices, flower_colors=None, scoring_system='anomaly'):
    """
    Nutrient choices is a list of flowers, each flower has 2 nutrients, e.g.:
    [["red", "blue"], ["yellow", "yellow"], ["blue", "blue"]]
    flower_colors: list of flower colors for each flower (for M&M scoring)
    scoring_system: 'anomaly' or 'mm'
    """
    import random
    results = []
    # Check for noise config
    noisy = False
    epsilon = 0.0
    # If called with extra kwargs, use them
    import inspect
    frame = inspect.currentframe().f_back
    session_config = getattr(frame.f_locals.get('player', None), 'session', None)
    if session_config:
        config = session_config.config
        noisy = config.get('noisy', False)
        epsilon = config.get('epsilon', 0.0)
    # Pick 1/3 of flowers to apply noise
    n_flowers = len(nutrient_choices)
    noise_indices = set()
    if noisy and n_flowers > 0:
        noise_indices = set(random.sample(range(n_flowers), max(1, n_flowers // 3)))
    noise_effects = []
    for i, nutrients in enumerate(nutrient_choices):
        noise = None
        if scoring_system == 'mm' and flower_colors:
            growth = calculate_growth_mm(nutrients, flower_colors[i])
        else:
            growth = calculate_growth(nutrients)
        # Apply noise if needed
        if noisy and i in noise_indices:
            if random.random() < 0.5:
                new_growth = min(1.0, growth + epsilon)
                noise = {'index': i, 'type': 'increase', 'amount': round(new_growth - growth, 3), 'before': round(growth, 3), 'after': round(new_growth, 3)}
                growth = new_growth
            else:
                new_growth = max(0.0, growth - epsilon)
                noise = {'index': i, 'type': 'decrease', 'amount': round(new_growth - growth, 3), 'before': round(growth, 3), 'after': round(new_growth, 3)}
                growth = new_growth
        results.append({
            'nutrients': nutrients,
            'growth': growth,
            'noise': noise
        })
    return results
    return results

def calculate_growth_mm(nutrients, flower_color):
    """
    Mix-and-match scoring for M&M config:
    - For primary colored flowers (Red, Blue, Yellow): best score for matching two same primary nutrients to same flower.
    - For secondary colored flowers (Orange, Green, Purple): best score for mixing correct two primary nutrients to match flower color.
    - Scores are normalized to same range as anomaly (max 1.0, min 0.0).
    """
    # Define color rules
    primary = {'Red', 'Blue', 'Yellow'}
    secondary_map = {
        'Orange': {'Red', 'Yellow'},
        'Green': {'Blue', 'Yellow'},
        'Purple': {'Red', 'Blue'}
    }
    n1 = nutrients[0] if len(nutrients) > 0 else ''
    n2 = nutrients[1] if len(nutrients) > 1 else ''
    # Primary flower: best is two matching nutrients
    if flower_color in primary:
        if n1 == flower_color and n2 == flower_color:
            return 1.0
        elif n1 == flower_color or n2 == flower_color:
            return 0.6
        elif n1 in primary and n2 in primary:
            return 0.4
        elif n1 or n2:
            return 0.3  # changed from 0.2 to 0.3
        else:
            return 0.0
    # Secondary flower: best is correct mix
    elif flower_color in secondary_map:
        correct_mix = secondary_map[flower_color]
        if {n1, n2} == correct_mix:
            return 1.0
        elif n1 in correct_mix or n2 in correct_mix:
            return 0.7
        elif n1 in primary and n2 in primary:
            return 0.5
        elif n1 or n2:
            return 0.3
        else:
            return 0.0
    # Fallback: anomaly scoring
    return calculate_growth([n1, n2])

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
