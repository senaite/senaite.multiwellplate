# -*- coding: utf-8 -*-
#
# This file is part of SENAITE.MULTIWELLPLATE.
#
# SENAITE.MULTIWELLPLATE is free software: you can redistribute it and/or
# modify it under the terms of the GNU General Public License as published
# by the Free Software Foundation, version 2.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
# details.
#
# You should have received a copy of the GNU General Public License along with
# this program; if not, write to the Free Software Foundation, Inc., 51
# Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#
# Copyright 2025 by it's authors.
# Some rights reserved, see README and LICENSE.

from plone.behavior.interfaces import IBehaviorAssignable
from plone.behavior.registration import BehaviorRegistration
from plone.dexterity.behavior import DexterityBehaviorAssignable
from plone.dexterity.schema import SCHEMA_CACHE
from zope.component import adapter
from zope.interface import implementer

from senaite.multiwellplate import is_installed
from senaite.multiwellplate.behaviors import IMultiWellPlateBehavior
from senaite.multiwellplate.behaviors import IPlateable
from senaite.multiwellplate.behaviors import MultiWellPlateFactory


@implementer(IBehaviorAssignable)
@adapter(IPlateable)
class MultiWellPlateBehaviorAssignable(DexterityBehaviorAssignable):
    """Extend
    """
    def __init__(self, context):
        self.context = context

    def supports(self, behavior_interface):
        if not is_installed():
            return False
        for behavior in self.enumerateBehaviors():
            if behavior_interface in behavior.interface._implied:
                return True
        return False

    def enumerateBehaviors(self):
        portal_type = self.context.portal_type
        behaviors = SCHEMA_CACHE.behavior_registrations(portal_type)
        registered = False
        for behavior in behaviors:
            if behavior.marker == IPlateable:
                registered = True
            yield behavior
        # additionally yield the schema registration if it was not already
        # registered via the FTI
        if not registered:
            yield self.multiwellplate_registration

    @property
    def multiwellplate_registration(self):
        return BehaviorRegistration(
            title="MultiWell Plate schema extender",
            description="Adds the ability plateable",
            interface=IMultiWellPlateBehavior,
            marker=IPlateable,
            factory=MultiWellPlateFactory,
        )
