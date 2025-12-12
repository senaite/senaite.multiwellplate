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

from senaite.core.registry import get_registry_record
from senaite.core.registry import set_registry_record

from senaite.multiwellplate import PRODUCT_NAME
from senaite.multiwellplate import logger

PROFILE_ID = "profile-{}:default".format(PRODUCT_NAME)


def install(context):
    """Generic setup handler
    """
    if context.readDataFile("{}.txt".format(PRODUCT_NAME)) is None:
        return

    logger.info("{} setup handler [BEGIN]".format(PRODUCT_NAME.upper()))
    portal = context.getSite()

    # -------- ADD YOUR STUFF BELOW --------

    logger.info("{} setup handler [DONE]".format(PRODUCT_NAME.upper()))


def pre_install(portal_setup):
    """Runs before the first import step of the *default* profile
    This handler is registered as a *pre_handler* in the generic setup profile
    :param portal_setup: SetupTool
    """

    logger.info("{} pre-install handler [BEGIN]".format(PRODUCT_NAME.upper()))
    context = portal_setup._getImportContext(PROFILE_ID)  # noqa
    portal = context.getSite()  # noqa

    logger.info("{} pre-install handler [DONE]".format(PRODUCT_NAME.upper()))


def post_install(portal_setup):
    """Runs after the last import step of the *default* profile
    This handler is registered as a *post_handler* in the generic setup profile
    :param portal_setup: SetupTool
    """
    logger.info("{} install handler [BEGIN]".format(PRODUCT_NAME.upper()))
    context = portal_setup._getImportContext(PROFILE_ID)  # noqa
    portal = context.getSite()  # noqa

    add_well_column_view_analysis()

    logger.info("{} install handler [DONE]".format(PRODUCT_NAME.upper()))


def post_uninstall(portal_setup):
    """Runs after the last import step of the *uninstall* profile
    This handler is registered as a *post_handler* in the generic setup profile
    :param portal_setup: SetupTool
    """
    logger.info("{} uninstall handler [BEGIN]".format(PRODUCT_NAME.upper()))

    # https://docs.plone.org/develop/addons/components/genericsetup.html#custom-installer-code-setuphandlers-py
    profile_id = "profile-senaite.multiwellplate:uninstall"
    context = portal_setup._getImportContext(profile_id)
    portal = context.getSite()  # noqa

    remove_well_column_view_analysis()

    logger.info("{} uninstall handler [DONE]".format(PRODUCT_NAME.upper()))


def add_well_column_view_analysis():
    """Insert column 'Well' after 'Pos' column for worksheet view
    """
    name = "worksheetview_analysis_columns_order"
    columns_order = get_registry_record(name, default=[]) or []
    new_order = []
    inserted = False
    for c in columns_order:
        new_order.append(c)
        if c == "Pos":
            new_order.append("Well")
            inserted = True
    if not inserted:
        new_order.append("Well")
    set_registry_record(name, new_order)


def remove_well_column_view_analysis():
    """Remove column 'Well' for worksheet view
    """
    name = "worksheetview_analysis_columns_order"
    columns_order = get_registry_record(name, default=[]) or []
    columns_order = list(filter(lambda c: c != "Well", columns_order))
    set_registry_record(name, columns_order)
