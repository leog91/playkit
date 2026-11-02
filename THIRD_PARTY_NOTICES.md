# Third-party data

The AoE II civilization descriptions, bonuses, technology information, and unit statistics in
`src/features/games/age-of-empires-ii/source-snapshot.json` are derived from
[Siege Engineers / aoe2techtree](https://github.com/SiegeEngineers/aoe2techtree).
The source revision and its update date are recorded in that file.
The upstream project extracts item metadata using genieutils-py.

Age of Empires II © Microsoft Corporation. PlayKit is not endorsed by or
affiliated with Microsoft or Siege Engineers. Microsoft-owned game content
remains subject to its applicable terms, including Microsoft's
[Game Content Usage Rules](https://www.xbox.com/en-us/developers/rules).
The manual data updater also imports locally served civilization crests and
unit/building/resource icons from that pinned revision. The parchment texture
was sourced separately from the same project. Exact image paths, picture-index
mappings, and the source revision are recorded in `public/aoe2/manifest.json`,
with further details in `public/aoe2/README.md`.
The upstream image credits name Hidden Path Entertainment, Forgotten Empires,
SkyBox Labs, and Ensemble Studios. These assets remain Microsoft/game-content
artwork; they are not relicensed under the MIT code license below.

## aoe2techtree license

MIT License

Copyright (c) 2018 HSZemi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
