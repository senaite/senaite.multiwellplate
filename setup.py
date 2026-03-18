# -*- coding: utf-8 -*-

from setuptools import setup, find_packages

version = "1.0.0"

with open("README.md", "r") as fh:
    long_description = fh.read()

setup(
    name="senaite.multiwellplate",
    version=version,
    description="A Senaite add-on providing tools for planning and managing "
                "multiwell plate layouts.",
    long_description=long_description,
    # long_description_content_type="text/markdown",
    # Get more strings from
    # http://pypi.python.org/pypi?:action=list_classifiers
    classifiers=[
        "Framework :: Plone",
        "Framework :: Zope2",
        "Programming Language :: Python",
        "License :: OSI Approved :: GNU General Public License v2 (GPLv2)",
    ],
    keywords=["senaite", "lims", "plate"],
    author="YME ROCKS",
    author_email="lt@yme.rocks",
    url="https://github.com/senaite/senaite.multiwellplate.git",
    license="GPLv2",
    packages=find_packages("src", exclude=["ez_setup"]),
    package_dir={"": "src"},
    namespace_packages=["senaite"],
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        "senaite.lims>=2.7.0",
        "senaite.core>=2.7.0",
        "setuptools",
    ],
    extras_require={
        "test": [
            "plone.app.testing",
            "unittest2",
        ]
    },
    entry_points="""
      # -*- Entry points: -*-
      [z3c.autoinclude.plugin]
      target = plone
      """,
)
