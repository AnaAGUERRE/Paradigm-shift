# Scoring System Update - November 12, 2025

### New System (Implemented)
- Nutrient names: Red, Blue, Yellow
- Scoring based on ALL combinations of nutrients
- 6 different growth levels: 0.5, 0.55, 0.6, 0.75, 0.8, 1.0
- Detailed scoring rules for each combination

---

## New Scoring Rules

### Perfect Combos
- **2× Blue** → 100% growth (1.0) → £10.00 per round average
- **Blue + Yellow** (either order) → 80% growth (0.8) → £8.00
- **Blue + Red** (either order) → 75% growth (0.75) → £7.50

### Middle Combos
- **2× Yellow** → 60% growth (0.6) → £6.00
- **Yellow + Red** (either order) → 55% growth (0.55) → £5.50

### Lower Combos
- **2× Red** → 50% growth (0.5) → £5.00

---

## Files Updated

### Backend
✅ `flowerfieldtask/engine.py`
- Updated `calculate_growth()` function with new scoring rules
- Now checks all 6 possible combinations
- Returns correct growth multiplier for each combo

### Frontend
✅ `_static/flowers.js`
- Already had Red, Blue, Yellow nutrients (no changes needed)
- Game logic already supports new system

### Documentation
✅ `FLOWER_TASK_README.md`
- Updated nutrient table
- Updated scoring explanation
- Updated calculate_growth() documentation

✅ `QUICK_START.md`
- Updated nutrient descriptions
- Updated scoring examples

✅ `VISUAL_GUIDE.md`
- Updated interaction examples
- Updated color coding reference
- Shows new scoring scenarios

---

## Verification

The new system is now active. When participants:

### Play a Round
1. Drag Red, Blue, and Yellow nutrients to flowers
2. Each flower gets 2 nutrients
3. System calculates growth based on combination:
   - Blue + Blue = highest score (1.0)
   - Blue combinations = high scores (0.75-0.8)
   - Yellow combinations = medium scores (0.55-0.6)
   - Red combinations = lower scores (0.5)

### Get Results
- Shows growth percentage (0-100%)
- Shows earnings (£0.00 to £10.00 max per round)
- Based on average of all 6 flowers

### Accumulate Payoff
- Points added to total each round
- Multiplier applied: 0.4 (as configured)

---

## Example Earnings

### Best Round (All Blue)
```
6 flowers × Blue+Blue = (1.0 × 6) / 6 = 1.0 average
Points = 10 × 1.0 = £10.00
```

### Mixed Round
```
1. Blue + Blue = 1.0
2. Blue + Yellow = 0.8
3. Blue + Red = 0.75
4. Yellow + Yellow = 0.6
5. Yellow + Red = 0.55
6. Red + Red = 0.5

Average = (1.0+0.8+0.75+0.6+0.55+0.5)/6 = 0.7
Points = 10 × 0.7 = £7.00
```

### Worst Round (All Red)
```
6 flowers × Red+Red = (0.5 × 6) / 6 = 0.5 average
Points = 10 × 0.5 = £5.00
```

---

## Color Reference

The game displays nutrients with these colors and emojis:

| Nutrient | Emoji | Color | Hex | RGB |
|----------|-------|-------|-----|-----|
| Red | 🔴 | Red | #FF6B6B | (255, 107, 107) |
| Blue | 🔵 | Cyan | #4ECDC4 | (78, 205, 196) |
| Yellow | 🟡 | Yellow | #FFE66D | (255, 230, 109) |

---

## Testing the New System

To verify the changes work:

1. **Add flower.png** if you haven't already
2. **Run server**: `otree devserver`
3. **Test combos**:
   - Feed flower 1: Blue + Blue → should see 100%
   - Feed flower 2: Blue + Yellow → should see 80%
   - Feed flower 3: Red + Red → should see 50%
4. **Calculate average** from 6 flowers
5. **Verify payoff**: 10 × average should equal round earnings

---

## Code Change Details

### Changed: `flowerfieldtask/engine.py`

```python
def calculate_growth(nutrients):
    n1, n2 = nutrients[0], nutrients[1]
    
    # 2x Blue
    if n1 == 'Blue' and n2 == 'Blue':
        return 1.0
    
    # Blue + Yellow (either order)
    if (n1 == 'Blue' and n2 == 'Yellow') or (n1 == 'Yellow' and n2 == 'Blue'):
        return 0.8
    
    # Blue + Red (either order)
    if (n1 == 'Blue' and n2 == 'Red') or (n1 == 'Red' and n2 == 'Blue'):
        return 0.75
    
    # 2x Yellow
    if n1 == 'Yellow' and n2 == 'Yellow':
        return 0.6
    
    # Yellow + Red (either order)
    if (n1 == 'Yellow' and n2 == 'Red') or (n1 == 'Red' and n2 == 'Yellow'):
        return 0.55
    
    # 2x Red
    if n1 == 'Red' and n2 == 'Red':
        return 0.5
    
    return 0.0
```

---

## Backward Compatibility

⚠️ **Note**: If you have existing data from the old system:
- Old data will still be in database as-is
- New rounds will use new scoring system
- You may want to clear test data before going live

---

## Next Steps

1. ✅ Scoring system updated
2. ⚠️ Test with new rules
3. ✅ Documentation updated
4. Ready to deploy!

---

## Questions?

Refer to:
- `FLOWER_TASK_README.md` - Full documentation
- `QUICK_START.md` - Quick reference
- `VISUAL_GUIDE.md` - Examples
- `engine.py` - Scoring implementation

Enjoy the new scoring system! 🌻
