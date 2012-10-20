/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

goog.provide('bc.view.Item');

/**
 * @interface
 */
bc.view.Item = function() {};

/**
 * @param {number=} pageScale
 * @param {boolean=} selected
 * @param {bc.Client.modes=} mode
 */
bc.view.Item.prototype.render = function(pageScale, selected, mode) {};

/**
 * @param {CanvasRenderingContext2D} ctx
 */
bc.view.Item.prototype.renderToContext = function(ctx) {};

/**
 */
bc.view.Item.prototype.destroy = function() {};
