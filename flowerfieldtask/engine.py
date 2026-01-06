
import random
import inspect

def run_engine(nutrient_choices, flower_colors=None, scoring_system='anomaly'):
    """
    Nutrient choices is a list of flowers, each flower has 2 nutrients, e.g.:
    [["red", "blue"], ["yellow", "yellow"], ["blue", "blue"]]
    # flower_colors and scoring_system are unused; only anomaly scoring is implemented
    """
    noise_type_counts = {'increase': 0, 'decrease': 0, 'none': 0}
    results = []
    noisy = False
    epsilon = 0.0
    frame = inspect.currentframe().f_back
    session_config = getattr(frame.f_locals.get('player', None), 'session', None)
    if session_config:
        config = session_config.config
        noisy = config.get('noisy', False)
        epsilon = config.get('epsilon', 0.0)
    n_flowers = len(nutrient_choices)
    for i, nutrients in enumerate(nutrient_choices):
        noise = None
        growth = calculate_growth(nutrients)
        if noisy:
            noise_choice = random.choice(['none', 'decrease', 'increase'])
            noise_type_counts[noise_choice] += 1
            if noise_choice == 'increase':
                new_growth = growth + epsilon
                noise = {'index': i, 'type': 'increase', 'amount': round(new_growth - growth, 3), 'before': round(growth, 3), 'after': round(new_growth, 3)}
                growth = new_growth
            elif noise_choice == 'decrease':
                new_growth = max(0.0, growth - epsilon)
                noise = {'index': i, 'type': 'decrease', 'amount': round(new_growth - growth, 3), 'before': round(growth, 3), 'after': round(new_growth, 3)}
                growth = new_growth
            else:
                noise = {'index': i, 'type': 'none', 'amount': 0.0, 'before': round(growth, 3), 'after': round(growth, 3)}
        results.append({
            'nutrients': nutrients,
            'growth': growth,
            'noise': noise
        })
    return results



def calculate_growth(nutrients):
    """
    Scoring Rules:
    - 2x Blue → 100% (1.0)
    - Blue + Yellow (either order) → 80% (0.8)
    - Blue + Red (either order) → 80% (0.8)
    - 2x Yellow → 60% (0.6)
    - Yellow + Red (either order) → 60% (0.6)
    - 2x Red → 60% (0.6)
    - Only Blue (if same one counted twice) → 50% (0.5)
    - Only Yellow (if same one counted twice) → 30% (0.3)
    - Only Red (if same one counted twice) → 30% (0.3)
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
            return 0.8
        if n1 == 'Yellow' and n2 == 'Yellow':
            return 0.6
        if (n1 == 'Yellow' and n2 == 'Red') or (n1 == 'Red' and n2 == 'Yellow'):
            return 0.6
        if n1 == 'Red' and n2 == 'Red':
            return 0.6
    # Case: Only one nutrient
    if n1 and not n2:
        if n1 == 'Blue':
            return 0.5
        if n1 == 'Yellow':
            return 0.3
        if n1 == 'Red':
            return 0.3
    if n2 and not n1:
        if n2 == 'Blue':
            return 0.5
        if n2 == 'Yellow':
            return 0.3
        if n2 == 'Red':
            return 0.3
    # Case: No valid nutrients
    return 0.0


def calculate_p_from_growth(growth):
    """
    Converts growth percentage to pennies for payment, format 'Xp'.
    """
    pennies = int(round(growth * 10))
    return f"{pennies}p"
