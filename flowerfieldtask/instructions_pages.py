# This file defines a minimal oTree app with instructions page.
# Note: In oTree, a "page" refers to a single web page in the experiment flow.
# Even if the instructions are split into multiple slides (10 here) using JavaScript,
# oTree still considers it one page if it is handled within the same Page class and template. 

# This file is used if you add 'instructions_pages' to the app_sequence in settings.py.

from otree.api import *  # Import oTree base classes and functions

class C(BaseConstants):
    NAME_IN_URL = 'flowerfieldtask'  # URL name for this app
    PLAYERS_PER_GROUP = None         # No grouping (individual play)
    NUM_ROUNDS = 1                   # Only one round (one page)

class Subsession(BaseSubsession):
    pass  # No custom logic for subsession

class Group(BaseGroup):
    pass  # No group logic needed

class Player(BasePlayer):
    pass  # No custom player fields

class Instructions(Page):
    def is_displayed(self):
        return self.round_number == 1  # Show only in the first round

page_sequence = [Instructions]  # Only one page in this app