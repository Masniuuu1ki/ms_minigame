local isMinigameActive = false
local success = false

function startGame()
    if isMinigameActive then return nil end

    isMinigameActive = true
    success = false

    SetNuiFocus(true, true)
    SendNUIMessage({ action = "startMinigame" })

    local promise = promise.new()

    Citizen.CreateThread(function()
        while isMinigameActive do
            Citizen.Wait(100)
        end

        SetNuiFocus(false, false)

        promise:resolve(success)
    end)

    return Citizen.Await(promise)
end

exports('startGame', startGame)

RegisterNUICallback('minigameResult', function(data, cb)
    success = data.success
    isMinigameActive = false
    cb('ok')
end)

RegisterCommand('testGame', function()
    local result = exports['ms_minigame']:startGame()
    if result then
        print('Completed')
    else
        print('Failed')
    end
end)
